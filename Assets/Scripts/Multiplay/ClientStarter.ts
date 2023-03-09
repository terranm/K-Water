import {ZepetoScriptBehaviour} from 'ZEPETO.Script'
import {Users, ZepetoWorldHelper, ZepetoWorldMultiplay} from 'ZEPETO.World'
import {Room, RoomData} from 'ZEPETO.Multiplay'
import {Player, State} from 'ZEPETO.Multiplay.Schema'
import {CharacterState, SpawnInfo, ZepetoPlayers, ZepetoPlayer, CharacterJumpState, ZepetoCharacter} from 'ZEPETO.Character.Controller'
import * as UnityEngine from "UnityEngine"
import CameraManager from '../Managers/CameraManager'
import GameBaseData from '../Managers/GameBaseData'
import UIManager from '../Managers/UIManager'
import { LightProbeUsage } from 'UnityEngine.Rendering'
import { AnalyticsType, ZepetoAnalyticsComponent } from 'ZEPETO.Analytics'
import { DirectorSampleTime } from 'UnityEngine.PlayerLoop.Initialization'

interface MessageTypeModel_Equip
{
    sessionId : string;
    itemName : string;
    equipPosition : string;
    isEquip : boolean;
}
interface MessageTypeModel_Gimmick
{
    sessionId : string;
    gimmickCode : string;
    isMoving : boolean;
}


export default class ClientStarter extends ZepetoScriptBehaviour {

    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Singleton
    private static _instance: ClientStarter;
    public static get instance(): ClientStarter { return ClientStarter._instance; }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Singleton END
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Property
    public multiplay: ZepetoWorldMultiplay;

    private _room: Room
    public get room(): Room
    { return this._room }
    public set room(value:Room)
    { this._room = value }
    private currentPlayers: Map<string, Player> = new Map<string, Player>();
    private zepetoPlayer : ZepetoPlayer;
    private player : Player;
    private cam : UnityEngine.Camera;
    private spawnPoint: UnityEngine.Transform;

    // private playerCur : CharacterState;
    public gestureClips: UnityEngine.AnimationClip[];

    gestureNum: number;
    SessionId: string;

    private dontPlayMotion:boolean;
    private _isCoroutinePlaying: boolean
    public get isCoroutinePlaying(): boolean { return this._isCoroutinePlaying }
    public set isCoroutinePlaying(value: boolean) { this._isCoroutinePlaying = value }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Property END
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Setting
    Awake()
    {
        ClientStarter._instance = this;
    }
    private Start() {

        const spawnObject = UnityEngine.GameObject.FindWithTag("SpawnPoint");
        if(spawnObject != null)
            this.spawnPoint = spawnObject.transform;

        this.multiplay.RoomCreated += (room: Room) => {
            this.room = room;
        };

        this.multiplay.RoomJoined += (room: Room) => {
            room.OnStateChange += this.OnStateChange;

            // room.AddMessageHandler("onStatusUpdate",(msg:object) => {                                               // Status Update Handler
            //     this.CharacterStatusUpdate();
            // })

            // room.AddMessageHandler("GestureNum", (message:number) => {
            //     this.gestureNum = message;
            // });

            // room.AddMessageHandler("Gesture", (message: string) => {
            //     // print server message
            //     let _sessionId = message;
            //     _sessionId = _sessionId.toString();
            //     console.log(typeof(_sessionId));
            //     console.log(typeof(this.SessionId));
            //     let _character = ZepetoPlayers.instance.GetPlayer(_sessionId);
               
            //     let Character = _character.character;
            //     Character.SetGesture(this.gestureClips[this.gestureNum]);
            //     this.StartCoroutine(this.StopCharacterGesture(this.gestureClips[this.gestureNum].length - 0.3, Character));
            // });
        };

        this.StartCoroutine(this.SendMessageLoop(0.1));
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Setting END
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Gesture
    // * StopCharacterGesture(length: number, character:ZepetoCharacter)
    // {
    //     yield new UnityEngine.WaitForSeconds(length);
    //     character.CancelGesture();
    // }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Gesture END
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Player Transform Send
    // Send the local character transform to the server at the scheduled Interval Time.
    private * SendMessageLoop(tick: number)
    {
        const baseData = GameBaseData.instance;
        let waitfortick = new UnityEngine.WaitForSeconds(tick);
        while (true) {
            yield waitfortick;

            if (this.room != null && this.room.IsConnected) {
                const hasPlayer = ZepetoPlayers.instance.HasPlayer(this.room.SessionId);                            // Send Player Transform
                if (hasPlayer) {
                    const myPlayer = ZepetoPlayers.instance.GetPlayer(this.room.SessionId);
                    // if (myPlayer.character.CurrentState != CharacterState.Idle)
                        // console.log(myPlayer.character.transform.name);
                        this.SendTransform(myPlayer.character.transform);
                }
            }
        }
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Player Transform Send END
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Main
    private OnStateChange(state: State, isFirst: boolean) {

        // When the first OnStateChange event is received, a full state snapshot is recorded.
        if (isFirst) {

            // [CharacterController] (Local) Called when the Player instance is fully loaded in Scene
            ZepetoPlayers.instance.OnAddedLocalPlayer.AddListener(() => {
                const myPlayer = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer;

                this.zepetoPlayer = myPlayer;                                                           // status 적용을 위해 zepetoPlayer 초기화

                const chara = myPlayer.character.gameObject;
                myPlayer.character.tag = "Player"; 
                // chara.AddComponent<PlayerManager>();                                                    // PlayerManager 추가
                
                myPlayer.character.Context.GetComponentsInChildren<UnityEngine.SkinnedMeshRenderer>().forEach((smr)=>{ // 캐릭터 반사광
                    smr.lightProbeUsage = LightProbeUsage.BlendProbes;
                });

                // this.CharacterStatusUpdate();                                                           // status 적용
                myPlayer.character.OnChangedState.AddListener((cur, next) => {
                    this.SendState(next);
                    // console.log(`cur : ${cur}`);
                    // switch(cur)
                    // {
                    //     case CharacterState.Falling :
                    //         this.StartCoroutine(this.CharacterFallingOut());                            // 추락 coroutine 호출
                    //         this.playerCur = cur;                                                       // 플레이어 상태 저장
                    //         break;
                    //     default : 
                    //         this.playerCur = cur;                                                       // 플레이어 상태 저장
                    //         break;
                    // }
                });

            });

            // [CharacterController] Called when the Player instance is fully loaded in Scene
            ZepetoPlayers.instance.OnAddedPlayer.AddListener((sessionId: string) => {
                const player: Player = this.currentPlayers.get(sessionId);
                const isLocal = this.room.SessionId === sessionId;
                if (!isLocal)
                {
                    this.player = player;
                    // const otherPlayer = ZepetoPlayers.instance.GetPlayer(sessionId);
                    // let scOtherPlayer = otherPlayer.character.gameObject.AddComponent<OtherPlayerManager>();

                    ZepetoPlayers.instance.GetPlayer(sessionId).character.Context.GetComponentsInChildren<UnityEngine.SkinnedMeshRenderer>().forEach((smr)=>{ // 캐릭터 반사광
                        smr.lightProbeUsage = LightProbeUsage.BlendProbes;
                    });
                    
                    // [RoomState] Called whenever the state of the player instance is updated. 
                    player.OnChange += (changeValues) => this.OnUpdatePlayer(sessionId, player);
                    
                }
            });
        }

        let join = new Map<string, Player>();
        let leave = new Map<string, Player>(this.currentPlayers);

        state.players.ForEach((sessionId: string, player: Player) => {
            if (!this.currentPlayers.has(sessionId))
            {
                join.set(sessionId, player);
            }
            leave.delete(sessionId);
        });

        // [RoomState] Create a player instance for players that enter the Room
        join.forEach((player: Player, sessionId: string) => this.OnJoinPlayer(sessionId, player));

        // [RoomState] Remove the player instance for players that exit the room
        leave.forEach((player: Player, sessionId: string) => this.OnLeavePlayer(sessionId, player));

        // this.CharacterStatusUpdate();                                                                   // status 적용
    }

    private OnJoinPlayer(sessionId: string, player: Player) {
        console.log(`[OnJoinPlayer] players - sessionId : ${sessionId}`);
        this.currentPlayers.set(sessionId, player);

        const baseData = GameBaseData.instance;
        const spawnInfo = new SpawnInfo();
        const position = baseData.ParseVector3(player.transform.position);
        const rotation = baseData.ParseVector3(player.transform.rotation);
        spawnInfo.position = position;
        spawnInfo.rotation = UnityEngine.Quaternion.Euler(rotation);

        if(this.spawnPoint != null)
        {
            spawnInfo.position = this.spawnPoint.position;
            spawnInfo.rotation = this.spawnPoint.rotation;
        }

        const isLocal = this.room.SessionId === player.sessionId;
        if(isLocal)
        {
            this.player = player;                                                                        // status 적용을 위해 Player 초기화
        }

        ZepetoPlayers.instance.CreatePlayerWithUserId(sessionId, player.zepetoUserId, spawnInfo, isLocal);
        
        // let canvas_arr = UnityEngine.GameObject.FindObjectsOfType<UnityEngine.Canvas>();              // canvas world cam 적용
        // let cam = ZepetoPlayers.instance.ZepetoCamera.camera;
        // canvas_arr.forEach(canvas => {
        //     canvas.GetComponent<UnityEngine.Canvas>().worldCamera = cam;
        // });

        this.cam = ZepetoPlayers.instance.ZepetoCamera.camera;
        if(this.cam.gameObject.GetComponent<CameraManager>() == null)
        {
            let camManager : CameraManager = this.cam.gameObject.AddComponent<CameraManager>();
            camManager.multiplay = this.multiplay;
        }
    }

    private OnLeavePlayer(sessionId: string, player: Player) {
        console.log(`[OnRemove] players - sessionId : ${sessionId}`);
        this.currentPlayers.delete(sessionId);

        ZepetoPlayers.instance.RemovePlayer(sessionId);
    }

    private OnUpdatePlayer(sessionId: string, player: Player)
    {

        const baseData = GameBaseData.instance;

        const position = baseData.ParseVector3(player.transform.position);
        const rotation = baseData.ParseVector3(player.transform.rotation);

        // const hasPlayer = ZepetoPlayers.instance.HasPlayer(sessionId);
        // if (!hasPlayer)
        //     return;

        const zepetoPlayer = ZepetoPlayers.instance.GetPlayer(sessionId);
        if(zepetoPlayer == null)
        {
            console.error(` ========================================== sessionId ${sessionId} `);
            console.error(` ========================================== OnUpdatePlayer NOT HAVE `);
            return;
        }

        // other player의 보이는 거리와 실제 거리를 비교
        let distance = UnityEngine.Vector3.Distance(position, zepetoPlayer.character.transform.position);
        
        if(distance > 3 || this.dontPlayMotion)                                                     // Teleport
        {
            zepetoPlayer.character.transform.position = position;
            zepetoPlayer.character.transform.rotation = UnityEngine.Quaternion.Euler(rotation);
        }
        else                                                                                        // Player Move
        {
            zepetoPlayer.character.MoveToPosition(position);
        }

        if (player.state === CharacterState.Jump) {                                                 // Player Jump
            if (zepetoPlayer.character.CurrentState !== CharacterState.Jump) {
                zepetoPlayer.character.Jump();
            }

            if (player.subState === CharacterJumpState.JumpDouble) {
                zepetoPlayer.character.DoubleJump();
            }
        }
        
        // if (player.isSit)
        // {     // other player SIT
        //     zepetoPlayer.character.gameObject.transform.position = position;
        //     zepetoPlayer.character.gameObject.transform.rotation = UnityEngine.Quaternion.Euler(rotation);
        //     zepetoPlayer.character.ZepetoAnimator.SetBool("Sit", player.isSit);
        //     zepetoPlayer.character.characterController.enabled = player.isSit;
        // }
        // else
        // {
        //     zepetoPlayer.character.ZepetoAnimator.SetBool("Sit", player.isSit);
        //     zepetoPlayer.character.characterController.enabled = player.isSit;
        // }
        
        // if (player.state === CharacterState.JumpIdle || player.state === CharacterState.JumpMove)   // Jump
        //     zepetoPlayer.character.Jump();
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Main END
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Server Send
    private SendState(state: CharacterState)                // player state
    {
        const data = new RoomData();
        data.Add("state", state);
        this.room.Send("onChangedState", data.GetObject());
    }
    private SendTransform(transform: UnityEngine.Transform) // player transform
    {
        const data = new RoomData();

        const pos = new RoomData();
        pos.Add("x", transform.position.x);
        pos.Add("y", transform.position.y);
        pos.Add("z", transform.position.z);
        data.Add("position", pos.GetObject());

        const rot = new RoomData();
        rot.Add("x", transform.eulerAngles.x);
        rot.Add("y", transform.eulerAngles.y);
        rot.Add("z", transform.eulerAngles.z);
        data.Add("rotation", rot.GetObject());

        // const pos = new RoomData();
        // pos.Add("x", transform.localPosition.x);
        // pos.Add("y", transform.localPosition.y);
        // pos.Add("z", transform.localPosition.z);
        // data.Add("position", pos.GetObject());

        // const rot = new RoomData();
        // rot.Add("x", transform.localEulerAngles.x);
        // rot.Add("y", transform.localEulerAngles.y);
        // rot.Add("z", transform.localEulerAngles.z);
        // data.Add("rotation", rot.GetObject());
        this.room.Send("onChangedTransform", data.GetObject());
    }
    // public SendRoomServerLog(message : string)             // test log
    // {
    //     this.room.Send("SL", message);
    // }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Server Send END
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Player Status
    // private CharacterStatusUpdate()
    // {
    //     if(this.zepetoPlayer == null || this.player == null)                                                         // status 적용 전 최종확인
    //     {
    //         if(this.currentPlayers.has(this.room.SessionId))
    //             this.player = this.currentPlayers.get(this.room.SessionId);
    //         else
    //             return;

    //         if(ZepetoPlayers.instance.LocalPlayer != null)
    //             this.zepetoPlayer = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer;
    //         else
    //             return;
    //     }
    //     this.zepetoPlayer.character.additionalRunSpeed = this.player.status.runSpeed;                                // status 적용
    //     this.zepetoPlayer.character.additionalWalkSpeed = this.player.status.walkSpeed;
    //     this.zepetoPlayer.character.additionalJumpPower = this.player.status.jumpPower;
    // }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Player Status END
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// World Fallout
    // private * CharacterFallingOut()
    // {
    //     let count : number = 0;                                                                                      // sec x 10
    //     while(count < 26)                                                                                            // 2.6초
    //     {
    //         yield new UnityEngine.WaitForSeconds(0.1);                                                               // 0.1초 마다 확인
    //         count++;
    //         if(this.playerCur != CharacterState.Falling || this.zepetoPlayer.character.transform.position.y < -30)
    //         {
    //             break;
    //         }
    //     }

    //     if(this.isCoroutinePlaying)
    //         return;

    //     if(this.zepetoPlayer.character.transform.position.y < 0)
    //     {
    //         // this.SendRoomServerLog(`월드 밖으로 떨어졌습니다.`);
    //         // console.log(` 월드 밖으로 떨어졌습니다. `);

    //         const fadeManager = UIManager.instance;
    //         fadeManager.PlayFadeInOut(fadeManager.FADE_FALLOUT);
    //         yield new UnityEngine.WaitForSeconds(1);

    //         const character = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character;
    //         character.enabled = false;
    //         ZepetoPlayers.instance.controllerData.inputAsset.Disable();
    //         character.StopMoving();
    //         let returnPos = new UnityEngine.Vector3(0, 0, 0);
            
    //         if(this.spawnPoint != null)
    //             returnPos = this.spawnPoint.position;

    //         character.Teleport(returnPos, UnityEngine.Quaternion.identity); // 복귀
    //         ZepetoPlayers.instance.controllerData.inputAsset.Enable();
    //         character.enabled = true;
    //     }
    //     this.StopCoroutine(this.CharacterFallingOut());
    // }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// World Fallout END
}
