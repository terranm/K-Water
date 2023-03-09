import { Collider, GameObject, Quaternion, SpriteRenderer, TouchScreenKeyboard, WaitForSeconds } from 'UnityEngine';
import { ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import GameBaseData from './Managers/GameBaseData';

export default class LookAt extends ZepetoScriptBehaviour {

    private renderer : SpriteRenderer;
    private collider : Collider;

    private isLooking : boolean
    // private waitForSeconds : WaitForSeconds;
    Start()
    {
        // this.waitForSeconds = GameBaseData.instance.WaitForSecond_01;

        let rend = $ref<SpriteRenderer>();
        if (this.TryGetComponent<SpriteRenderer>(rend)){
            this.renderer = rend.value;
        }
        if(this.renderer) this.renderer.enabled = false;
        
        let col = $ref<Collider>();
        if (this.TryGetComponent<Collider>(col)){
            this.collider = col.value;
        }
        if(this.collider) this.collider.enabled = false;
    }

    public StartLooking(col : Collider)
    {
        let baseData = GameBaseData.instance;
        if(!baseData.CanITriggerActivating(col))
            return;
        
        if(this.collider) this.collider.enabled = true;
        if(this.renderer) this.renderer.enabled = true;
        this.isLooking = true;
        this.StartCoroutine(this.LookAtLocalPlayer());
    }
    
    public StopLooking(col : Collider)
    {
        let baseData = GameBaseData.instance;
        if(!baseData.CanITriggerActivating(col))
            return;

        if(this.renderer) this.renderer.enabled = false;
        if(this.collider) this.collider.enabled = false;
        this.isLooking = false;
        this.StopCoroutine(this.LookAtLocalPlayer());
    }

    private * LookAtLocalPlayer()
    {
        this.transform.LookAt(ZepetoPlayers.instance.LocalPlayer.zepetoCamera.cameraParent.GetChild(0).transform.position);
        let waitForSeconds = new WaitForSeconds(0.01);
        while(this.isLooking)
        {
            yield waitForSeconds;//GameBaseData.instance.WaitForSecond_01;//this.waitForSeconds//new WaitForSeconds(1);//
            this.transform.LookAt(ZepetoPlayers.instance.LocalPlayer.zepetoCamera.cameraParent.GetChild(0).transform.position);
        }
        this.StopCoroutine(this.LookAtLocalPlayer());
    }
}