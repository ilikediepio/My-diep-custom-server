import GameServer from "../../../Game";
import ObjectEntity from "../../Object";

import { PhysicsFlags, Color } from "../../../Const/Enums";

/**
 * Visual-only preview of a MazeWall.
 * Does not interact with players or other physical entities.
 */
export default class GhostWall extends ObjectEntity {
    private static ghosts = new Set<GhostWall>();

    private ownerTank: any;

    public constructor(
        game: GameServer,
        x : number,
        y : number,
        width : number,
        height : number,
        ownerTank : any
    ) {
        super(game);

        this.ownerTank = ownerTank;

        this.positionData.values.x = x;
        this.positionData.values.y = y;

        this.physicsData.values.width = width;
        this.physicsData.values.size = height;
        this.physicsData.values.sides = 2;

        //this.physicsData.values.flags |= PhysicsFlags.showsOnMap;

        this.styleData.values.borderWidth = 10;
        this.styleData.values.color = Color.Box;
        this.styleData.values.opacity = 0.2;

        GhostWall.ghosts.add(this);
    }

    public setPosition(x: number, y : number) {
        this.positionData.values.x = x;
        this.positionData.values.y = y;
    }

    public static deleteForTank(tank: any) {
        for (const ghost of this.ghosts) {
            if (ghost.ownerTank === tank) {
                ghost.delete();
            }
        }
    }

    public delete() {
        GhostWall.ghosts.delete(this);
        super.delete();
    }
}