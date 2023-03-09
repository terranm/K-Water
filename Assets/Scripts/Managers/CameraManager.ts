import { GameObject, Input, LayerMask, Mathf, Physics, RaycastHit } from 'UnityEngine'
import { ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { ZepetoChat } from 'ZEPETO.Chat';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { ZepetoWorldMultiplay } from 'ZEPETO.World';
import GameManager from './GameManager';

export default class CameraManager extends ZepetoScriptBehaviour {

    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Singleton
    private static _instance: CameraManager;
    public static get instance(): CameraManager { return CameraManager._instance; }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Singleton END
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Property
    private layer_btn : number;
    public multiplay : ZepetoWorldMultiplay;
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Property END
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Setting
    Start()
    {
        CameraManager._instance = this;

        this.layer_btn = 1 << LayerMask.NameToLayer("Button");

   
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Setting END
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Raycast
    Update()
    {
        // if (this.multiplay.Room != null && this.multiplay.Room.IsConnected)
        // {
        //     const hasPlayer = ZepetoPlayers.instance.HasPlayer(this.multiplay.Room.SessionId);
        //     if (hasPlayer)
        //     {
                this.Raycasting();
                this.Culling();
        //     }
        // }
    }

    private test:number = 0;
    Raycasting()
    {
        if(Input.GetMouseButtonDown(0))
        {
            
            let ray = ZepetoPlayers.instance.ZepetoCamera.camera.ScreenPointToRay(Input.mousePosition);
            let hitInfo = $ref<RaycastHit>();
            let isHit = Physics.Raycast(ray, hitInfo, 20, this.layer_btn)
            if(isHit)
            {
                GameManager.instance.SwitchButtonScript(hitInfo.value.transform)
            }
        }
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////// Raycast END

    private charcterObj1 : GameObject;
    private charcterObj2 : GameObject;
    private cameraObj : GameObject;
    private isSetting : boolean = false;
    
    Culling(){
        if (this.multiplay.Room != null && this.multiplay.Room.IsConnected)
        {
            const hasPlayer = ZepetoPlayers.instance.HasPlayer(this.multiplay.Room.SessionId);
            if (hasPlayer)
            {
                if (this.isSetting == false) {
                    try {
                        this.charcterObj1 = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.transform.GetChild(0).GetChild(0).gameObject;
                        this.charcterObj2 = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.transform.GetChild(0).GetChild(1).gameObject
                        this.cameraObj = ZepetoPlayers.instance.LocalPlayer.zepetoCamera.cameraParent.transform.GetChild(0).gameObject;
                        this.isSetting = true;
                    } catch (error) {
                        console.log(error)
                        this.isSetting = false;
                    }
                }
        
                if (this.cameraObj.transform.localPosition.z > -0.5){
                    this.charcterObj1.SetActive(false);
                    this.charcterObj2.SetActive(false);
                }else{
                    this.charcterObj1.SetActive(true);
                    this.charcterObj2.SetActive(true);
                }
            }
        }
        
    }
}