import { BoxCollider, Collider, GameObject, Mathf, Quaternion, Time, Transform, Vector3, WaitForSeconds } from 'UnityEngine';
import { Text } from 'UnityEngine.UI';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import GameBaseData from './Managers/GameBaseData';
import ResourceManager from './Managers/ResourceManager';

export default class NPCController extends ZepetoScriptBehaviour {
    
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Property
    private pop:GameObject;

    private isRocking:boolean = false;
    private isLooking:boolean = false;
    @SerializeField()
    private _isChecked: boolean = false;
    public get isChecked(): boolean { return this._isChecked; }
    public set isChecked(value: boolean) { this._isChecked = value; }
    // private waitForSeconds :WaitForSeconds;
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Property END
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Setting
    Start()
    {
        this._isChecked = false;
        // console.log(this._isChecked);
        // this.transform.GetComponentInChildren<BoxCollider>().enabled = false;
        // this.waitForSeconds = GameBaseData.instance.WaitForSecond_2;//new WaitForSeconds(2);
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Setting END
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Trigger
    OnTriggerEnter(collider: Collider)
    {
        let baseData = GameBaseData.instance;
        if(!baseData.CanITriggerActivating(collider))
            return;
            
        if(!this.isLooking)                                                                                    // coroutine 작동 확인
            this.StartCoroutine(this.StartLooking(collider.transform))

        // this.transform.GetComponentInChildren<BoxCollider>().enabled = true;
    }

    OnTriggerExit(collider : Collider)
    {
        let baseData = GameBaseData.instance;
        if(!baseData.CanITriggerActivating(collider))
            return;
            
        this.isLooking = false;
        // this.transform.GetComponentInChildren<BoxCollider>().enabled = false;

        if(this.isLooking)
            this.StopCoroutine(this.StartLooking(collider.transform));
            
        // if(this.tag == "QuestTarget")
        // {
        //     // Test
        //     this.ReturnPopupNPC();
        // }
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Trigger END
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// MissionComplete
    public MissionComplete()
    {
        // this.ReturnPopupNPC();
        this.gameObject.SetActive(false);
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// MissionComplete END
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Looking
    * StartLooking(player:Transform)
    {
        if(this.isLooking)
            return;
        this.isLooking = true;
        
        let timer = 0.01;

        while(this.isLooking)
        {
            yield new WaitForSeconds(timer);

            let dir = Quaternion.LookRotation(player.transform.position - this.transform.position).normalized;
            dir.x = 0;
            dir.z = 0;
            this.transform.rotation = Quaternion.Slerp(this.transform.rotation, dir, timer * 15);
        }
        this.StopCoroutine(this.StartLooking(player));
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Looking END
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// PopUp
    // FloatingPopupNPC()
    // {
    //     console.log(this.pop);
        
    //     if(this.pop)
    //         return;

    //     let property = this.transform.GetComponentInChildren<NPCDangerProperty>();
    //     let name = property.name;
        
    //     this.pop = ResourceManager.instance.GetGameObjectInPool("Popup_NPC", this.transform);
    //     this.pop.transform.localRotation = Quaternion.identity;
    //     this.pop.transform.localPosition = new Vector3(0, 2.7, 0);
    //     this.pop.name = `POP_${name}`;

    //     let btn = this.pop.transform.GetChild(0); // set Button
    //     btn.name = `POP_${name}.Button`;

    //     let text = this.pop.transform.GetComponentsInChildren<Text>()[0];
    //     text.text = property.GetText;
        
    //     console.log(` text.text : ${text.text} `);
        
    // }
    // public ReturnPopupNPC()
    // {
    //     if(this.pop == null)
    //         return;
            
    //     ResourceManager.instance.ReturnGameObjectInPool("Popup_NPC", this.pop);
    //     this.pop = null;
    // }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// PopUp END

    public FindedNPCAction(){
        this.StartCoroutine(this.DisappearEffect());
        this.gameObject.SetActive(false);
        // this.transform.parent.gameObject.SetActive(false);
        return this._isChecked;
    }
    private Eff : GameObject;
    public SetEffect(){
        // 사라지는 이펙트 재생
        if (this._isChecked){
            this.Eff = ResourceManager.instance.Instantiate("Effect_V");
        }
        else {
            this.Eff = ResourceManager.instance.Instantiate("Effect_X");
        }
        this.Eff.transform.position = this.transform.position;
        // this.Eff.transform.SetParent(this.transform);
        this.Eff.SetActive(false);
    }

    private * DisappearEffect(){
        this.Eff.SetActive(true);
        yield new WaitForSeconds(2);//GameBaseData.instance.WaitForSecond_2;
        ResourceManager.instance.Destroy(this.Eff);        
        this.StopCoroutine(this.DisappearEffect());
    }

    // private CheckSP(){
    //     let tr = this.gameObject.GetComponentsInChildren<Transform>();
    //     console.log("tr.length", tr.length );
    //     return (tr.length > 2);
    // }
}