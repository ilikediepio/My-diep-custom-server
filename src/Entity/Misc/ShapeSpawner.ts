/*
    DiepCustom - custom tank game server that shares diep.io's WebSocket protocol
    Copyright (C) 2022 ABCxFF (github.com/ABCxFF)

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published
    by the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
    GNU Affero General Public License for more details.
*/

import GameServer from "../../Game";
import ObjectEntity from "../Object";

import { Color, StyleFlags, PhysicsFlags } from "../../Const/Enums";

import AbstractShape from "../Shape/AbstractShape";
import Square from "../Shape/Square";
import Triangle from "../Shape/Triangle";
import Pentagon from "../Shape/Pentagon";
import Hexagon from "../Shape/Hexagon";
import AlphaPentagon from "../Shape/AlphaPentagon";
import AlphaHexagon from "../Shape/AlphaHexagon";

import { tps } from "../../config";

type ShapeWeights = {
    square: number;
    triangle: number;
    pentagon: number;
    hexagon: number;
    alphapentagon: number;
    alphahexagon: number;
};

/**
 * Shape spawner for the gravity gamemode.
 *
 * The spawner is a visible rectangular area that periodically
 * creates shapes within its bounds.
 *
 * Its middle section occupies a configurable fraction of the
 * total width and always spans the full height.
 */
export default class ShapeSpawner extends ObjectEntity {

    // =========================================================
    // CONFIGURATION
    // =========================================================

    /** Seconds between spawn attempts. */
    public static SPAWN_INTERVAL_SECONDS = 0.1;

    /** Maximum living shapes tracked by each spawner. */
    public static MAX_ACTIVE_SHAPES = 2000;

    /** Number of shapes created during each spawn attempt. */
    public static SHAPES_PER_ATTEMPT = 1;

    /**
     * Fraction of the total spawner width assigned to the
     * central section.
     *
     * 0.0 = no middle section
     * 0.5 = central half of the width
     * 1.0 = entire spawner is considered the middle section
     */
    public static MIDDLE_SECTION_SIZE = 0.3;

    /**
     * Relative shape weights for the two regions.
     *
     * These are weights rather than strict percentages:
     * they are automatically normalized.
     *
     * Edge example:
     * 70 / 25 / 5 = 70% squares, 25% triangles, 5% pentagons.
     */
    public static EDGE_SHAPE_WEIGHTS: ShapeWeights = {
        square: 50,
        triangle : 25,
        pentagon : 15,
        hexagon : 9.4,
        alphapentagon : 0.5,
        alphahexagon : 0.1
    };

    public static MIDDLE_SHAPE_WEIGHTS: ShapeWeights = {
        square: 6,
        triangle : 21.75,
        pentagon : 50,
        hexagon : 21,
        alphapentagon : 1.0,
        alphahexagon : 0.25
    };

    /** Appearance of the spawn-area rectangle. */
    public static AREA_OPACITY = 0.1;

    // =========================================================
    // INTERNAL CONSTANTS
    // =========================================================

    /**
     * Current regular-shape sizes:
     * square/triangle = 55 * sqrt(1/2)
     * pentagon        = 75 * sqrt(1/2)
     *
     * Keep these in sync with the corresponding shape classes
     * if their sizes change.
     */
    private static readonly MAX_SHAPE_RADIUS =
        300 * Math.SQRT1_2;

    // =========================================================
    // INSTANCE DATA
    // =========================================================

    private readonly spawnWidth : number;
    private readonly spawnHeight : number;

    /** Shapes created by this particular spawner. */
    private spawnedShapes: AbstractShape[] = [];

    /** Tick at which the next spawn attempt becomes available. */
    private nextSpawnTick: number;

    public constructor(
        game: GameServer,
        x : number,
        y : number,
        width : number,
        height : number
    ) {
        super(game);

        if (
            !Number.isFinite(x) ||
            !Number.isFinite(y) ||
            !Number.isFinite(width) ||
            !Number.isFinite(height) ||
            width <= 0 ||
            height <= 0
            ) {
            this.delete();

            throw new RangeError(
                "ShapeSpawner requires finite coordinates and positive dimensions."
            );
        }

        this.spawnWidth = width;
        this.spawnHeight = height;

        this.positionData.x = x;
        this.positionData.y = y;

        // -----------------------------------------------------
        // Visible rectangular spawn area
        // -----------------------------------------------------

        // This entity manages spawning; it is not a solid wall.
        this.isPhysical = false;

        this.physicsData.sides = 2;

        // For rectangular entities, size defines the horizontal
        // dimension and width defines the vertical dimension.
        this.physicsData.size = width;
        this.physicsData.width = height;

        this.physicsData.pushFactor = 0;
        this.physicsData.absorbtionFactor = 0;

        this.styleData.flags |= StyleFlags.isVisible;
        this.styleData.color = Color.Neutral;
        this.styleData.opacity = ShapeSpawner.AREA_OPACITY;
        this.physicsData.values.flags |= PhysicsFlags.showsOnMap | PhysicsFlags.noOwnTeamCollision

        // Keep a defined outline around the spawn area.
        this.styleData.borderWidth = 4;

        // Delay the first spawn until one full interval passes.
        this.nextSpawnTick =
            game.tick + ShapeSpawner.getSpawnIntervalTicks();
    }

    // =========================================================
    // UPDATE
    // =========================================================

    public override tick(tick: number) {
        super.tick(tick);

        // Stop processing if this spawner is being removed.
        if (this.hash === 0 || this.deletionAnimation) {
            return;
        }

        this.removeInactiveShapes();

        if (tick < this.nextSpawnTick) {
            return;
        }

        // Start the next interval from the current tick.
        this.nextSpawnTick =
            tick + ShapeSpawner.getSpawnIntervalTicks();

        const attempts = Math.max(
            0,
            Math.floor(ShapeSpawner.SHAPES_PER_ATTEMPT)
        );

        const maxShapes = Math.max(
            0,
            Math.floor(ShapeSpawner.MAX_ACTIVE_SHAPES)
        );

        for (let i = 0; i < attempts; i++) {
            if (this.spawnedShapes.length >= maxShapes) {
                break;
            }

            this.spawnOneShape();
        }
    }

    private static getSpawnIntervalTicks() : number{
        const seconds = Number.isFinite(
            ShapeSpawner.SPAWN_INTERVAL_SECONDS
        )
            ? Math.max(0, ShapeSpawner.SPAWN_INTERVAL_SECONDS)
            : 2;

        // At least one tick between attempts.
        return Math.max(1, Math.round(seconds * tps));
    }

        // =========================================================
        // SHAPE TRACKING
        // =========================================================

        private removeInactiveShapes() {
        this.spawnedShapes = this.spawnedShapes.filter(shape =>
            shape.hash !== 0 &&
            shape.healthData.values.health > 0 &&
            !shape.deletionAnimation
        );
    }

    /**
     * Also remove this spawner's shapes if the spawner itself
     * is deleted, preventing orphaned shapes and stale tracking.
     */
    public override delete() {
        for (const shape of this.spawnedShapes) {
            if (shape.hash !== 0) {
                shape.destroy(false);
            }
        }

        this.spawnedShapes.length = 0;

        super.delete();
    }

    // =========================================================
    // SPAWNING
    // =========================================================

    private spawnOneShape() {
        const position = this.randomSpawnPosition();

        if (!position) {
            return;
        }

        // Determine the region using the intended spawn X
        // coordinate BEFORE selecting the shape type.
        const weights = this.getShapeWeightsForX(position.x);
        const shape = this.createRandomShape(weights);

        if (!shape) {
            // No supported shape is small enough to fit here.
            return;
        }

        shape.positionData.x = position.x;
        shape.positionData.y = position.y;

        this.spawnedShapes.push(shape);
    }

    /**
     * Randomize the position while reserving sufficient space
     * for every shape that can fit within this rectangle.
     */
    private randomSpawnPosition() : {
    x: number;
    y: number;
    } {
        const margin = Math.min(
            ShapeSpawner.MAX_SHAPE_RADIUS,
            this.spawnWidth / 2,
            this.spawnHeight / 2
        );

        const centerX = this.positionData.values.x;
        const centerY = this.positionData.values.y;

        const minX = centerX - this.spawnWidth / 2 + margin;
        const maxX = centerX + this.spawnWidth / 2 - margin;

        const minY = centerY - this.spawnHeight / 2 + margin;
        const maxY = centerY + this.spawnHeight / 2 - margin;

        return {
            x: minX + Math.random() * (maxX - minX),
            y : minY + Math.random() * (maxY - minY)
        };
    }

    // =========================================================
    // REGIONS
    // =========================================================

    /**
     * Returns the shape weights appropriate for the sampled X.
     *
     * The middle region is centered horizontally and spans the
     * entire height of the spawner. Both outside portions are
     * treated as the edge region.
     */
    private getShapeWeightsForX(x: number) : ShapeWeights{
        const configuredSize = ShapeSpawner.MIDDLE_SECTION_SIZE;

        const middleSize = Number.isFinite(configuredSize)
            ? Math.max(0, Math.min(1, configuredSize))
            : 0;

        if (middleSize === 0) {
            return ShapeSpawner.EDGE_SHAPE_WEIGHTS;
        }

        const centerX = this.positionData.values.x;
        const middleHalfWidth =
            (this.spawnWidth * middleSize) / 2;

        const middleLeft = centerX - middleHalfWidth;
        const middleRight = centerX + middleHalfWidth;

        if (x >= middleLeft && x <= middleRight) {
            return ShapeSpawner.MIDDLE_SHAPE_WEIGHTS;
        }

        return ShapeSpawner.EDGE_SHAPE_WEIGHTS;
    }

        // =========================================================
        // WEIGHTED SHAPE SELECTION
        // =========================================================

        /**
         * Select a shape based on the weights for the region.
         *
         * Weights are normalized automatically. If all the weights
         * are zero, the available shape types are selected equally.
         * Shapes that cannot fit inside the spawner are excluded. (make sure that the spawner is at least 300x300 if you want all shapes to spawn)
         */
        private createRandomShape(
            weights: ShapeWeights
        ) : AbstractShape | null{
            const maxAllowedRadius = Math.min(
                this.spawnWidth / 2,
                this.spawnHeight / 2
            );

            const cleanWeight = (value: number) : number =>
                Number.isFinite(value) ? Math.max(0, value) : 0;

            // Maximum radii used to determine whether each shape fits.
            const squareFits =
                55 * Math.SQRT1_2 <= maxAllowedRadius;

            const triangleFits =
                55 * Math.SQRT1_2 <= maxAllowedRadius;

            const pentagonFits =
                75 * Math.SQRT1_2 <= maxAllowedRadius;

            const hexagonFits =
                100 <= maxAllowedRadius;

            const alphaPentagonFits =
                200 <= maxAllowedRadius;

            const alphaHexagonFits =
                300 <= maxAllowedRadius;

            // Apply configured weights only to shapes that fit.
            let squareWeight =
                squareFits ? cleanWeight(weights.square) : 0;

            let triangleWeight =
                triangleFits ? cleanWeight(weights.triangle) : 0;

            let pentagonWeight =
                pentagonFits ? cleanWeight(weights.pentagon) : 0;

            let hexagonWeight =
                hexagonFits ? cleanWeight(weights.hexagon) : 0;

            let alphaPentagonWeight =
                alphaPentagonFits ? cleanWeight(weights.alphapentagon) : 0;

            let alphaHexagonWeight =
                alphaHexagonFits ? cleanWeight(weights.alphahexagon) : 0;

            let totalWeight =
                squareWeight +
                triangleWeight +
                pentagonWeight +
                hexagonWeight +
                alphaPentagonWeight +
                alphaHexagonWeight;

            // If all eligible configured weights are zero,
            // choose equally among the shapes that fit.
            if (totalWeight <= 0) {
                squareWeight = squareFits ? 1 : 0;
                triangleWeight = triangleFits ? 1 : 0;
                pentagonWeight = pentagonFits ? 1 : 0;
                hexagonWeight = hexagonFits ? 1 : 0;
                alphaPentagonWeight = alphaPentagonFits ? 1 : 0;
                alphaHexagonWeight = alphaHexagonFits ? 1 : 0;

                totalWeight =
                    squareWeight +
                    triangleWeight +
                    pentagonWeight +
                    hexagonWeight +
                    alphaPentagonWeight +
                    alphaHexagonWeight;
            }

            if (totalWeight <= 0) {
                return null;
            }

            // Weighted random selection.
            let roll = Math.random() * totalWeight;

            if (roll < squareWeight) {
                return new Square(this.game, false);
            }
            roll -= squareWeight;

            if (roll < triangleWeight) {
                return new Triangle(this.game, false);
            }
            roll -= triangleWeight;

            if (roll < pentagonWeight) {
                return new Pentagon(this.game, false, false);
            }
            roll -= pentagonWeight;

            if (roll < hexagonWeight) {
                return new Hexagon(this.game, false);
            }
            roll -= hexagonWeight;

            if (roll < alphaPentagonWeight) {
                return new AlphaPentagon(this.game, false);
            }

            return new AlphaHexagon(this.game, false);
    }
}