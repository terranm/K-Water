declare module "ZEPETO.Multiplay.Schema" {

	import { Schema, MapSchema, ArraySchema } from "@colyseus/schema"; 


	interface State extends Schema {
		players: MapSchema<Player>;
	}
	class Player extends Schema {
		sessionId: string;
		zepetoHash: string;
		zepetoUserId: string;
		transform: ZepetoTransform;
		state: number;
		subState: number;
		status: Status;
		isSit: boolean;
		isGesture: boolean;
		curgesture: number;
		nextgesture: number;
		getNPC: GetNPC;
	}
	class ZepetoTransform extends Schema {
		position: ZepetoVector3;
		rotation: ZepetoVector3;
	}
	class ZepetoVector3 extends Schema {
		x: number;
		y: number;
		z: number;
	}
	class Status extends Schema {
		walkSpeed: number;
		runSpeed: number;
		jumpPower: number;
	}
	class EquipPosition extends Schema {
		Head: Equip;
		Right: Equip;
		Left: Equip;
	}
	class Equip extends Schema {
		isEquip: boolean;
		itemName: string;
	}
	class GetNPC extends Schema {
		isGetA: boolean;
		isGetB: boolean;
		isGetC: boolean;
	}
}