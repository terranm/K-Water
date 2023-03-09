import { BoxCollider, GameObject, LayerMask, SpriteRenderer, Transform, Vector3, WaitForSeconds } from "UnityEngine";
import { ZepetoPlayers } from "ZEPETO.Character.Controller";
import { Room, RoomData } from "ZEPETO.Multiplay";
import { ZepetoScriptBehaviour } from "ZEPETO.Script";
import { ZepetoWorldMultiplay } from "ZEPETO.World";
import ClientStarter from "../Multiplay/ClientStarter";
import NPCController from "../NPCController";
import ZepetoAnalytics from "./ZepetoAnalytics";
import GameBaseData from "./GameBaseData";
import UIManager from "./UIManager";
import ResourceManager from "./ResourceManager";
import MapController from "../MapController";
import NPCSpaceMove from "../NPCSpaceMove";

export default class GameManager extends ZepetoScriptBehaviour {

    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Singleton
    private static _instance: GameManager;
    public static get instance(): GameManager { return GameManager._instance; }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Singleton END
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Property
    public multiplay : ZepetoWorldMultiplay;
    private room : Room;

    // private zepetoAnalytics : ZepetoAnalytics;
    
    // private npcCounter:Array<number> = new Array<number>();
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Property END

    public questState : number = 0;
    // private waitForSeconds : WaitForSeconds;
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Setting
    Awake()
    {    
 
    }
    Start()
    {
        GameManager._instance = this;

        this.multiplay.RoomCreated += (room : Room) => {
            this.room = room;
        };
        // this.npcSpace_obj.SetActive(false);
        // const loadingUI = UIManager.instance.FindLoadingImage(UIManager.instance.LOADING_START);
        // if(loadingUI != null)
        // this.waitForSeconds = new WaitForSeconds(2);
        this.StartCoroutine(this.StartLoading());

        // for(let i=0; i<3; i++)
        //     this.npcCounter.push(0); //GameBaseData.instance.WaitForSecond_2;
        // this.zepetoAnalytics = GameObject.Find("ZepetoAnalytics").GetComponent<ZepetoAnalytics>();
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Setting END
    public npcSpace_obj : GameObject;
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Loading Image Start
    private * StartLoading()//loadingUI:GameObject)
    {
        let isLoading = true;
        while (UIManager.instance == null){
            yield null;
        }
        UIManager.instance.PlayLoading();
            // UIManager.instance.LOADING_START); 
        // loadingUI.SetActive(true);
        ZepetoPlayers.instance.controllerData.inputAsset.Disable();

        const baseData = GameBaseData.instance;
        // let waitForSeconds = new WaitForSeconds(2);
        while (isLoading)
        {
            if (this.room != null && this.room.IsConnected)
            {
                if (ZepetoPlayers.instance.HasPlayer(this.room.SessionId))
                {
                    isLoading = false;
                    ZepetoPlayers.instance.controllerData.inputAsset.Enable();
                    this.NPCSetting();
                    this.questState = UIManager.instance.StartQuest();
                    this.DroneObj = GameObject.Find("Drone_Animation_Handler");
                    this.DroneObj.SetActive(false);
                    // this.npcSpace_obj.SetActive(true);
                    
                    UIManager.instance.StopLoading();
                        // UIManager.instance.LOADING_START); 
                }
            }
            yield new WaitForSeconds(2)//GameBaseData.instance.WaitForSecond_2;//waitForSeconds;
        }
        this.StopCoroutine(this.StartLoading());
        // UIManager.instance.StartQuest();
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Loading Image END
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Raycast Button Start
    SwitchButtonScript(btn : Transform)
    {
        // if(this.room == null)
        //     this.room = ClientStarter.instance.room;

        let names = btn.name.split(`_`);                // 이름 분할로 인한 스크립트 분류   ex) Button_Speed => ButtonScript_SpeedUp
        switch (names[0]) {
            case "Button":
                switch (names[1]) {
                    case "Chair" :
                        this.ButtonScript_PlayerSitDown(btn);                        
                        break;        
                    case "Building" :
                        UIManager.instance.ShowPopUp("UI_POP_"+names[2]);
                        break;
                }
                break;
            case "NPC":
                switch (names[1]) {
                    case "Danger" :
                        this.NPCFind(btn.parent.parent.parent);
                        break;
                    case "Bang" :
                        btn.parent.gameObject.SetActive(false);
                        this.questState = UIManager.instance.StartQuest();
                        break;
                    // case "WorldTop" :
                    //     UIManager.instance.ShowPopUp("UI_POP_WorldTop");
                    //     break;
                }
                break;
        
            default:
                console.error(`이름이 설정되지 않은 버튼이 있습니다. ${btn.name}`)
                break;
        }
    }

    /// quest Start coroutine
    public QuestStart(){
        this.StartCoroutine(this._QuestStart());
    }
    private *_QuestStart(){
        UIManager.instance.PlayEff(0);
        yield new WaitForSeconds(2)//GameBaseData.instance.WaitForSecond_2;
        UIManager.instance.SetTimer(true);
        UIManager.instance.SetQuestCnt(true, this.collectSPNPCcnt);
        this.NPCsTr.gameObject.SetActive(true);
        this.MapCtrl.IconOnOff(true);
        this.MapCtrl.ActiveNPCQuestTarget(this.spNum.toString());
        this.StopCoroutine(this._QuestStart());
    }
    private DroneObj : GameObject;
    private *QuestClear(){
        UIManager.instance.PlayEff(1);
        yield new WaitForSeconds(2)//GameBaseData.instance.WaitForSecond_2;
        this.questState = UIManager.instance.StartQuest();
        UIManager.instance.SetTimer(false);
        // UIManager.instance.SetQuestCnt(false, this.collectSPNPCcnt);
        this.NPCsTr.gameObject.SetActive(false);
        this.DroneObj.SetActive(true);
        this.MapCtrl.IconOnOff(false);
        this.StopCoroutine(this.QuestClear());
        // this.StopAllCoroutines();
        this.npcSpace_obj.GetComponent<NPCSpaceMove>().SpaceOn();
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////// Status
    // SendStatusUpgrade(runSpeed : number, walkSpeed : number, jumpPower : number)
    // {
    //     const data = new RoomData();

    //     const status = new RoomData();
    //     status.Add("runSpeed", runSpeed);
    //     status.Add("walkSpeed", walkSpeed);
    //     status.Add("jumpPower", jumpPower);
    //     data.Add("status", status.GetObject());

    //     this.room.Send("onStatusUpgrade", data.GetObject());
    // }
    ////////////////////////////////////////////////////////////////////////////////////////////////// Status END
    private NPCsTr : Transform;
    private spNum :number = 0;
    // NPC 배치
    private NPCSetting(){
        // NPC 할당
        let NPCsCtrl = GameObject.Find("NPCPoints").GetComponentsInChildren<NPCController>();
        this.NPCsTr = NPCsCtrl[0].transform.parent.transform;
        let waterNPCs = new Array<Transform>();
        let gasNPCs = new Array<Transform>();
        let sudoNPCs = new Array<Transform>();
        NPCsCtrl.forEach((tr)=>{
            let NPCbtn = tr.transform.GetChild(0);
            let star = NPCbtn.GetChild(0).GetChild(3);

            let npcType = NPCbtn.name.split("_")[2];
            switch (npcType) {
                case "water":
                    let waterType = NPCbtn.name.split("_")[3];
                    NPCbtn.GetChild(0).GetChild(4).gameObject.SetActive(false);
                    NPCbtn.GetChild(0).GetChild(5).gameObject.SetActive(false);
                    NPCbtn.GetChild(0).GetChild(6).gameObject.SetActive(false);
                    switch (waterType) {
                        case "drought":
                            NPCbtn.GetChild(0).GetChild(4).gameObject.SetActive(true);
                            break;
                        case "flood":
                            NPCbtn.GetChild(0).GetChild(5).gameObject.SetActive(true);
                            break;
                        case "algal":
                            NPCbtn.GetChild(0).GetChild(6).gameObject.SetActive(true);
                            break;
                    }
                    waterNPCs.push(NPCbtn);
                    break;
                case "gas":
                    gasNPCs.push(NPCbtn);
                    break;
                case "sudo":
                    sudoNPCs.push(NPCbtn);
                    break;
            }
            star.gameObject.SetActive(false);
            tr.gameObject.SetActive(false);
        });

        // 각 NPC ON,OFF
        this.TransformArraySuffle(waterNPCs);
        this.TransformArraySuffle(gasNPCs);
        this.TransformArraySuffle(sudoNPCs);
        this.spNum = Math.floor(Math.random() * 3);
        for(let i = 0; i < 4; i++){
            waterNPCs[i].parent.gameObject.SetActive(true);
            gasNPCs[i].parent.gameObject.SetActive(true);
            sudoNPCs[i].parent.gameObject.SetActive(true);
            console.log(waterNPCs[i].name, i, waterNPCs[i].gameObject.activeSelf);
            switch (this.spNum) {
                case 0:
                    this.SetSP(waterNPCs[i]);
                    break;
                case 1:
                    this.SetSP(gasNPCs[i]);                    
                    break;
                case 2:
                    this.SetSP(sudoNPCs[i]);                    
                    break;
            }
            waterNPCs[i].parent.GetComponent<NPCController>().SetEffect();
            gasNPCs[i].parent.GetComponent<NPCController>().SetEffect();
            sudoNPCs[i].parent.GetComponent<NPCController>().SetEffect();
        }
        UIManager.instance.SetQuestCntImg(this.spNum);
        this.NPCsTr.gameObject.SetActive(false);
        this.MapCtrlObj.SetActive(true);
        this.MapCtrl = this.MapCtrlObj.GetComponent<MapController>();
        this.MapCtrl.NPCSet();
        this.MapCtrl.IconOnOff(false);
        this.MapCtrlObj.SetActive(false);
    }

    private TransformArraySuffle(array : Array<Transform>){
        array.sort(() => Math.random() - 0.5);
    }

    private SetSP(NPCtr:Transform){
        let NPCCtrl = NPCtr.parent.GetComponent<NPCController>();
        NPCCtrl.isChecked = true;
        NPCtr.GetChild(0).GetChild(3).gameObject.SetActive(true);
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////// NPC Quest
    private collectSPNPCcnt : number = 0;
    public MapCtrlObj : GameObject;
    private MapCtrl : MapController;
    NPCFind(npc: Transform)
    {
        const nc = npc.GetComponent<NPCController>();
        // if(nc == null)
        //     return;

        let isSP = nc.FindedNPCAction();
        if (isSP){
            UIManager.instance.SetQuestCnt(true, ++this.collectSPNPCcnt);
            if (this.collectSPNPCcnt >= 4){
                nc.MissionComplete();
                this.StartCoroutine(this.QuestClear());
            }
        }
        this.MapCtrl.NPCTrace(npc.name);        
    }

    // CheckingNPC(npc: Transform)
    // {
    //     const nc = npc.GetComponentInParent<NPCController>();
    //     if(nc == null)
    //         return;
        
    //     nc.MissionComplete();
    // }
    ////////////////////////////////////////////////////////////////////////////////////////////////// NPC Quest END
    ////////////////////////////////////////////////////////////////////////////////////////////////// Sit Chair
    ButtonScript_PlayerSitDown(trans : Transform)
    {
        const chair = this.SitButtonActivate(trans, false);
        const sitPosition = chair.GetChild(1);

        ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.Teleport(sitPosition.position, sitPosition.rotation);
        this.StartCoroutine(this.StartContinuousAnimation());
    }

    private * StartContinuousAnimation()
    {
        // this.SendSitState(true);
        const character = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character;
        console.log(character.ZepetoAnimator.GetBool("isSit"));
        
        while(character.ZepetoAnimator.GetBool("isSit"))
        {
            yield null;
        }
        character.ZepetoAnimator.SetBool("isSit", true);
        
        console.log(character.ZepetoAnimator.name);
        console.log(character.ZepetoAnimator.GetBool("isSit"));
        this.StopCoroutine(this.StartContinuousAnimation());
    }

    PlayerSitOut(trans : Transform)
    {
        // this.SendSitState(false);
        ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.ZepetoAnimator.SetBool("isSit", false);
        let chair = this.SitButtonActivate(trans, true);
        let sitPosition = chair.GetChild(1);
        let look = sitPosition.position + (sitPosition.forward*0.3);
        ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.Teleport(look, sitPosition.rotation)
        
    }
    
    private SitButtonActivate(trans: Transform, isActive:boolean)
    {
        const chair = trans.parent.parent;
        chair.GetComponent<BoxCollider>().enabled = isActive;

        const collider = trans.GetComponent<BoxCollider>();
        const renderer = trans.GetComponent<SpriteRenderer>();
        const sitPointCollider = chair.GetChild(1).GetComponents<BoxCollider>()[0];
        if (collider)
            collider.enabled = isActive;
        if (renderer)
            renderer.enabled = isActive;
        if (sitPointCollider)
            sitPointCollider.enabled = !isActive;
        return chair;
    }

    // SendSitState(sit: boolean)
    // {
    //     // this.multiplay.Room.Send("Sit", sit);
    // }
    ////////////////////////////////////////////////////////////////////////////////////////////////// Sit Chair END
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Raycast Button END
}