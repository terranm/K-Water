import { Collider, Transform, Vector2, Vector3, WaitForFixedUpdate, WaitForSeconds } from "UnityEngine";
import { ZepetoPlayer, ZepetoPlayers } from "ZEPETO.Character.Controller";
import { ZepetoVector3 } from "ZEPETO.Multiplay.Schema";

export default class GameBaseData
{
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Singleton
    private constructor () {  }
    private static _instance : GameBaseData;
    public static get instance(): GameBaseData
    {
        if(this._instance == null)
            this._instance = new GameBaseData();
        return this._instance;
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Singleton END
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Property
    public readonly walkSpeed : number = 3;
    public readonly runSpeed : number = 5;
    public readonly jumpPower : number = 14;
    public readonly walkSpeedMax : number = 4;
    public readonly runSpeedMax : number = 8;
    public readonly jumpPowerMax : number = 20;
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Property END

    public WaitForSecond_2 : WaitForSeconds;
    public WaitForSecond_1 : WaitForSeconds ;
    public WaitForSecond_075 : WaitForSeconds;
    public WaitForSecond_05 : WaitForSeconds;
    public WaitForSecond_01 : WaitForSeconds;
    public WaitForSecond_003 : WaitForSeconds;
    public WaitForSecond_001 : WaitForSeconds;
    public WaitForFixed_Update : WaitForFixedUpdate;

    Awake(){
        this.WaitForSecond_2 = new WaitForSeconds(2);
        this.WaitForSecond_1 = new WaitForSeconds(1);
        this.WaitForSecond_075 = new WaitForSeconds(0.75);
        this.WaitForSecond_05 = new WaitForSeconds(0.5);
        this.WaitForSecond_01 = new WaitForSeconds(0.1);
        this.WaitForSecond_003 = new WaitForSeconds(0.03);
        this.WaitForSecond_001 = new WaitForSeconds(0.01);
        this.WaitForFixed_Update = new WaitForFixedUpdate();
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Get Player Partition Position
    public GetHeadTransform(sessionId : string) : Transform
    {
        return ZepetoPlayers.instance.GetPlayer(sessionId).character.transform
        .GetChild(0).GetChild(1).GetChild(2).GetChild(0).GetChild(1).GetChild(1).GetChild(0);
    }
    public GetLeftHandTransform(sessionId : string) : Transform
    {
        return ZepetoPlayers.instance.GetPlayer(sessionId).character.transform
        .GetChild(0).GetChild(1).GetChild(2).GetChild(0).GetChild(1).GetChild(2).GetChild(1).GetChild(1).GetChild(0).GetChild(1).GetChild(0);
    }
    public GetRightHandTransform(sessionId : string) : Transform
    {
        return ZepetoPlayers.instance.GetPlayer(sessionId).character.transform
        .GetChild(0).GetChild(1).GetChild(2).GetChild(0).GetChild(1).GetChild(3).GetChild(1).GetChild(1).GetChild(0).GetChild(1).GetChild(0);
    }
    public GetNoseTransform(character : Transform) : Transform
    {
        return character.GetChild(0).GetChild(1).GetChild(2).GetChild(0).GetChild(1).GetChild(1).GetChild(0).transform;
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Get Player Partition Position END
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Player Partitions Vector
    public GetLeftHandPosCatched() : Vector3 { return new Vector3(-0.07, -0.05, 0); }
    public GetRightHandPosCatched() : Vector3 { return new Vector3(0.07, 0.05, 0); }
    public GetMiddleSmallSize() : Vector3 { return new Vector3(0.5, 0.5, 0.5); }
    public GetVerySmallSize() : Vector3   { return new Vector3(0.1, 0.1, 0.1); }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Player Partitions Vector END
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Recycle Method
    /////////////////////////////////////////////////////// Get Map Item
    public GetMapsItem<T extends Object>(key : string, map :Map<string, T>) : T
    {
        if(map.has(key)) return map.get(key);
        else             return null;
    }
    
    /////////////////////////////////////////////////////// ZepetoVector3 to Vector3
    public ParseVector3(vector3: ZepetoVector3): Vector3 {
        return new Vector3
        (
            vector3.x,
            vector3.y,
            vector3.z
        );
    }

    /////////////////////////////////////////////////////// Collider is Local Player?
    public CanITriggerActivating(collider:Collider) : boolean
    {
        if(ZepetoPlayers.instance.LocalPlayer == null)
            return;

        if (collider.tag != "Player")                                                                          // tag 확인
            return false;

        const character = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.gameObject                 // localPlayer 작동 확인
        if(collider.gameObject != character)
            return false;

        return true;
    }
    
    /////////////////////////////////////////////////////// Vector3 to Vector2
    public ParseVectorWorldToMap(world:Vector3) : Vector2
    {
        // map x -340 ~ 290 315 +25 // world z -84 ~ -219 67.5
        // map y -340 ~ 300 320 +25 // world x -4.5 ~ 130.5 67.5
        const x = (world.z + 151.5) * -5 - 20;
        const y = (world.x - 63) * 5 - 20;
        return new Vector2(x, y);
    }
    
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Recycle Method END
}