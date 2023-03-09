import { CharacterController, Collider, GameObject, WaitForSeconds } from 'UnityEngine';
import { ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import GameBaseData from './Managers/GameBaseData';
import UIManager from './Managers/UIManager';
import ClientStarter from './Multiplay/ClientStarter';

export default class PortalTeleport extends ZepetoScriptBehaviour {
    
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Property
    @SerializeField()
    private targetPoint : GameObject;
    private isPlaying: boolean;
    // private waitForSeconds : WaitForSeconds;
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Property END
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Setting
    Start()
    {
        // this.waitForSeconds =  new WaitForSeconds(0.75); //GameBaseData.instance.WaitForSecond_075;
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Setting END
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Trigger
    OnTriggerEnter(collider : Collider)
    {
        let baseData = GameBaseData.instance;
        if(!baseData.CanITriggerActivating(collider))
            return;
        
        if(!this.isPlaying)                                                                                    // coroutine 확인
            this.StartCoroutine(this.TeleportActivate(collider));
    }

    OnTriggerExit(collider : Collider)
    {
        let baseData = GameBaseData.instance;
        if(!baseData.CanITriggerActivating(collider))
            return;

        this.StopCoroutine(this.TeleportActivate(collider));
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Trigger END
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Teleport
    private * TeleportActivate(collider : Collider)
    {
        if(this.isPlaying)                                                                                     // coroutine 최종확인
            return;

        this.isPlaying = true;
        ClientStarter.instance.isCoroutinePlaying = true;


        let zepetoCharacter = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character;
        let fadeManager = UIManager.instance;

        ZepetoPlayers.instance.controllerData.inputAsset.Disable();
        zepetoCharacter.gameObject.GetComponent<CharacterController>().enabled = false;
        zepetoCharacter.StopMoving();                                                                          // 움직임 봉쇄
        zepetoCharacter.Teleport(this.targetPoint.transform.position, zepetoCharacter.transform.rotation);     // teleport

        fadeManager.PlayLoading();                                                 // Loading
        
        yield new WaitForSeconds(0.75);//this.waitForSeconds; // GameBaseData.instance.WaitForSecond_075;//

        zepetoCharacter.gameObject.GetComponent<CharacterController>().enabled = true;
        ZepetoPlayers.instance.controllerData.inputAsset.Enable();
        
        fadeManager.StopLoading();                                                 // Loading

        this.isPlaying = false;                                                                                // recycle
        ClientStarter.instance.isCoroutinePlaying = false;
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Teleport END

}