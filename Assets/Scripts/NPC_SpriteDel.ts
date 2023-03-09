import { Collider, GameObject, SpriteRenderer } from 'UnityEngine';
import { ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import GameBaseData from './Managers/GameBaseData';

export default class NPC_SpriteDel extends ZepetoScriptBehaviour {
    private imgSprite : SpriteRenderer;
    Start()
    {
        this.imgSprite = this.transform.GetChild(1).GetComponent<SpriteRenderer>();
    }

    OnTriggerEnter(collider : Collider)
    {
        let baseData = GameBaseData.instance;
        if(!baseData.CanITriggerActivating(collider))
            return;
        
        this.imgSprite.enabled = false;
    }
    OnTriggerExit(collider : Collider)
    {
        let baseData = GameBaseData.instance;
        if(!baseData.CanITriggerActivating(collider))
            return;
        
        this.imgSprite.enabled = true;
    }
}