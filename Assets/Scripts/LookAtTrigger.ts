import { Collider, GameObject } from 'UnityEngine';
import { ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import LookAt from './LookAt';
import GameBaseData from './Managers/GameBaseData';

export default class LookAtTrigger extends ZepetoScriptBehaviour {

    private lookAt : LookAt;

    Start()
    {
        this.lookAt = this.transform.GetComponentInChildren<LookAt>();
    }

    OnTriggerEnter(collider : Collider)
    {
        let baseData = GameBaseData.instance;
        if(!baseData.CanITriggerActivating(collider))
            return;
        
        this.lookAt.StartLooking(collider);
    }
    OnTriggerExit(collider : Collider)
    {
        let baseData = GameBaseData.instance;
        if(!baseData.CanITriggerActivating(collider))
            return;
        
        this.lookAt.StopLooking(collider);
    }
}