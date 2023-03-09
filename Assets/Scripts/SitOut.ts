import { BoxCollider, Collider, WaitForFixedUpdate } from 'UnityEngine';
import { ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import GameBaseData from './Managers/GameBaseData';
import GameManager from './Managers/GameManager';

export default class SitOut extends ZepetoScriptBehaviour {

    private isSitting : boolean;
    private col : Collider;
    // private waitforfixedupdate:WaitForFixedUpdate;
    Start() {    
        this.isSitting = false;
        this.col = this.transform.GetComponents<BoxCollider>()[0];
        this.col.enabled = false;
        // this.waitforfixedupdate = new WaitForFixedUpdate();
    }

    OnTriggerEnter(collider:Collider){
        let baseData = GameBaseData.instance;
        if(baseData.CanITriggerActivating(collider)){
            this.isSitting = true;
            this.StartCoroutine(this.SittingCheck());
        }        
    }

    *SittingCheck(){
        while(this.isSitting){
            yield new WaitForFixedUpdate();//GameBaseData.instance.WaitForFixed_Update;//
            let character = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character
            if (character.tryMove || character.tryJump){
                console.log("tryMove ", character.tryMove, "tryJump ", character.tryJump);
                if (this.isSitting) {
                    this.isSitting = false;
                    let button = this.transform.parent.GetChild(2).GetChild(0);
                    GameManager.instance.PlayerSitOut(button);
                }
            }
        }
        this.StopCoroutine(this.SittingCheck());
    }

    OnTriggerExit(collider:Collider)
    {
        let baseData = GameBaseData.instance;
        if(baseData.CanITriggerActivating(collider))
        {
            if (!this.isSitting) return;
            this.isSitting = false;
            let button = this.transform.parent.GetChild(2).GetChild(0);
            GameManager.instance.PlayerSitOut(button);
        }
    }
}