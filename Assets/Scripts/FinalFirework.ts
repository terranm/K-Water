import { Collider, GameObject, WaitForSeconds } from 'UnityEngine';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import GameBaseData from './Managers/GameBaseData';

export default class FinalFirework extends ZepetoScriptBehaviour {
    public fireworkObj : GameObject;
    Start()
    {
        this.fireworkObj.SetActive(false);
    }

    OnTriggerEnter(collider : Collider)
    {
        let baseData = GameBaseData.instance;
        if(!baseData.CanITriggerActivating(collider))
            return;
        
            this.fireworkObj.SetActive(true);
            this.StartCoroutine(this.OffFireWork());
    }

    private * OffFireWork(){
        yield new WaitForSeconds(12);
        this.fireworkObj.SetActive(false);
    }
    // OnTriggerExit(collider : Collider)
    // {
    //     let baseData = GameBaseData.instance;
    //     if(!baseData.CanITriggerActivating(collider))
    //         return;
        
    //     this.imgSprite.enabled = true;
    // }

}