import { Collider, GameObject, Quaternion, Transform, Vector3, WaitForSeconds } from 'UnityEngine';
import { ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import GameBaseData from './Managers/GameBaseData';
import UIManager from './Managers/UIManager';
import ClientStarter from './Multiplay/ClientStarter';

export default class PhotoZoneFallout extends ZepetoScriptBehaviour {

    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Property
    public spawnPoint:Transform;
    // private waitForSeconds : WaitForSeconds;
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Property
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Setting
    Start()
    {    
        this.spawnPoint = GameObject.FindWithTag("SpawnPoint").transform;
        // this.waitForSeconds = new WaitForSeconds(1); // GameBaseData.instance.WaitForSecond_1;
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Setting END
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Trigger
    OnTriggerEnter(collider:Collider)
    {
        let baseData = GameBaseData.instance;
        if(!baseData.CanITriggerActivating(collider))
            return;

        this.StartCoroutine(this.CharacterFallingOut());
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Trigger END
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Teleport
    private * CharacterFallingOut()
    {
        // let client = ClientStarter.instance;
        
        // if(client.isCoroutinePlaying)
        //     return;

        // client.isCoroutinePlaying = true;

        // client.SendRoomServerLog(`월드 밖으로 떨어졌습니다.`);
        // console.log(` 월드 밖으로 떨어졌습니다. `);

        let fadeManager = UIManager.instance;
        fadeManager.PlayFadeInOut(fadeManager.FADE_FALLOUT);
        yield new WaitForSeconds(1); //this.waitForSeconds; //GameBaseData.instance.WaitForSecond_1;//

        let character = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character;
        character.enabled = false;
        ZepetoPlayers.instance.controllerData.inputAsset.Disable();
        character.StopMoving();
        character.Teleport(this.spawnPoint.position, Quaternion.identity); // 복귀

        // client.isCoroutinePlaying = false;
        ZepetoPlayers.instance.controllerData.inputAsset.Enable();
        character.enabled = true;
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Teleport END
}