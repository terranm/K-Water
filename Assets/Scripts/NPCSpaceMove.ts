import { Quaternion, Time, Vector3, WaitForFixedUpdate } from 'UnityEngine'
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'

export default class NPCSpaceMove extends ZepetoScriptBehaviour {
    // private RotY :number = 0;
    // private PosY :number = 0;
    // private isPos :boolean = false;
    // private pos :number = this.transform.position.y;

    Start() {    
        this.gameObject.SetActive(false);
    }

    public SpaceOn(){
        this.gameObject.SetActive(true);
        this.StartCoroutine(this.Move());
    }

    // Update(){
    //     // yield new WaitForFixedUpdate();
    //     this.RotY += Time.deltaTime;
    //     if (this.RotY > 360) {
    //         this.RotY = 0;
    //     }
    //     this.transform.localRotation = Quaternion.Euler(new Vector3(0,this.RotY,0));
        
    //     let time = 0;
    //     if (this.isPos){
    //         time = Time.deltaTime;
    //     }
    //     else {
    //         time = -Time.deltaTime;
    //     }
    //     this.PosY += time;
    //     if (this.PosY > 5){
    //         this.isPos = false;
    //         this.PosY = 5;
    //     }
    //     else if (this.PosY < -5){
    //         this.isPos = true;
    //         this.PosY = -5
    //     }
    //     // console.log("PosY",PosY);
    //     this.transform.position = new Vector3(this.transform.position.x,this.pos + this.PosY,this.transform.position.z);
    // }

    private * Move(){
        let RotY = 0;
        let PosY = 0;
        let isPos = false;
        let pos = this.transform.position.y;
        while(true){
            yield new WaitForFixedUpdate();
            RotY += Time.deltaTime;
            if (RotY > 360) {
                RotY = 0;
            }
            this.transform.localRotation = Quaternion.Euler(new Vector3(0,RotY,0));
            
            let time = 0;
            if (isPos){
                time = Time.deltaTime;
            }
            else {
                time = -Time.deltaTime;
            }
            PosY += time;
            if (PosY > 5){
                isPos = false;
                PosY = 5;
            }
            else if (PosY < -5){
                isPos = true;
                PosY = -5
            }
            // console.log("PosY",PosY);
            this.transform.position = new Vector3(this.transform.position.x,pos + PosY,this.transform.position.z);
        }
    }

}