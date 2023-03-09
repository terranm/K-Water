import { GameObject, Mathf, RectTransform, Transform, Vector2, Vector3, WaitForSeconds } from 'UnityEngine';
import { Image } from 'UnityEngine.UI';
import { ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import GameBaseData from './Managers/GameBaseData';
import GameManager from './Managers/GameManager';
import NPCController from './NPCController';

export default class MapController extends ZepetoScriptBehaviour {

    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Property
    private icon_player:Image;
    private icon_NPCs:Image[];

    public NPCs:GameObject;

    private player:Transform;
    private npcMap:Map<string, GameObject>;
    private npcQuestTarget:Image[];

    private isTracing:boolean = false;

    // private waitForSeconds : WaitForSeconds;
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Property END
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Setting
    Awake()
    {
        // console.log("MapCtrl Awake");
        let imgs = this.GetComponentsInChildren<Image>();
        this.icon_NPCs = new Array<Image>();
        this.npcQuestTarget = new Array<Image>();
        
        for(let img of imgs)
        {
            switch(img.tag)
            {
                case "Icons": 
                    if(img.name.includes("Player"))
                        this.icon_player = img;
                    else if(img.name.includes("NPC"))
                        this.icon_NPCs.push(img);

                    img.GetComponent<RectTransform>().anchoredPosition = new Vector2(2000, 0);
                    break;
                case "MapQuestTarget": 
                    this.npcQuestTarget.push(img);
                    img.gameObject.SetActive(false);
                    break;
            }
        } 
        this.npcMap = new Map<string, GameObject>();
    }

    Start()
    {

        // this.waitForSeconds = GameBaseData.instance.WaitForSecond_1;
    }

    public NPCSet(){
        let npcs = this.NPCs.GetComponentsInChildren<NPCController>();
        for(let i=0; i<npcs.length; i++)
        {
            this.icon_NPCs[i].gameObject.SetActive(true);
            let rect = this.icon_NPCs[i].GetComponent<RectTransform>();
            rect.anchoredPosition = GameBaseData.instance.ParseVectorWorldToMap(npcs[i].transform.position);
            this.npcMap.set(npcs[i].name, this.icon_NPCs[i].gameObject);
        }
        
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Setting END
    public NPCTrace(npcName:string){            
        this.npcMap.get(npcName).SetActive(false);
        // let npcs = this.NPCs.GetComponentsInChildren<NPCController>();
        // this.IconReset();
        // let baseData = GameBaseData.instance;
        // for(let i=0; i<npcs.length; i++)
        // {
        //     this.icon_NPCs[i].gameObject.SetActive(true);
        //     let rect = this.icon_NPCs[i].GetComponent<RectTransform>();
        //     rect.anchoredPosition = baseData.ParseVectorWorldToMap(npcs[i].transform.position);
        // }
    }
    public IconOnOff(isOn : boolean){
        if (this.icon_NPCs.length <= 0) return;
        this.icon_NPCs.forEach((icon)=>{
            icon.gameObject.SetActive(isOn);
        });

    }
    public ActiveNPCQuestTarget(str:string){
        this.npcQuestTarget.forEach((tar)=>{
            if (tar.name.includes(str))
                tar.gameObject.SetActive(true);
        });
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// public Coroutine
    public StartTracingPlayer()
    {
        this.StartCoroutine(this.TracingPlayer());
    }
    public StopTracingPlayer()
    {
        this.isTracing = false;
        this.StopCoroutine(this.TracingPlayer());
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// public Coroutine END
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Tracing Player
    private * TracingPlayer()
    {
        if(this.isTracing)
            return;
        this.isTracing = true;
        
        // if (GameManager.instance.questState > 0){
        //     this.NPCTrace();
        // }

        if(this.player == null)
            this.player = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.transform;

        let baseData = GameBaseData.instance;
        let waitForSeconds = new WaitForSeconds(0.01);
        while(this.isTracing)
        {
            let rect = this.icon_player.GetComponent<RectTransform>();
            rect.anchoredPosition = baseData.ParseVectorWorldToMap(this.player.position);
            yield waitForSeconds;//GameBaseData.instance.WaitForSecond_1;//
        }
        this.isTracing = false;
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Tracing Player END
}