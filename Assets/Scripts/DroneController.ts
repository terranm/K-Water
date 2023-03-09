import { Animator, CharacterController, Collider, Transform, Vector3, WaitForSeconds } from 'UnityEngine';
import { CharacterState, ZepetoCharacter, ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import GameBaseData from './Managers/GameBaseData';

export default class DroneController extends ZepetoScriptBehaviour {

    private anim:Animator;
    private isMoving:boolean;
    Start()
    {
        this.anim = this.GetComponentInChildren<Animator>();
    }

    OnTriggerEnter(collider: Collider)
    {
        let baseData = GameBaseData.instance;
        if(!baseData.CanITriggerActivating(collider))
            return;
        
        if(this.anim == null)
            return;
        console.log("drone1");
        this.StartCoroutine(this.OnCharacterMove(collider.transform));

        if(!this.isMoving)                                                                                    // coroutine 작동 확인
            this.StartCoroutine(this.StartMoveAnimation(collider.transform, true));
    }
    
    private * StartMoveAnimation(character: Transform, localPlayer:boolean)                                   // main corountine method
    {
        yield new WaitForSeconds(0.3);
        if(this.isMoving)
            return;
        this.isMoving = true;
        
        character.SetParent(this.anim.transform);
        character.gameObject.GetComponent<CharacterController>().enabled = false;

        this.anim.SetBool("IsPlay", true);
        this.anim.SetTrigger("Flight");
        yield new WaitForSeconds(0.5);

        while( ! this.anim.GetCurrentAnimatorStateInfo(0).IsName("Idle"))
        {
            yield new WaitForSeconds(0.5);
            
            if(this.anim.GetCurrentAnimatorStateInfo(0).IsName("Recycle"))
                break;
        }

        character.SetParent(null);
        this.StopCoroutine(this.OnCharacterMove(character));
        this.anim.gameObject.SetActive(false);
        character.gameObject.GetComponent<CharacterController>().enabled = true;

        yield new WaitForSeconds(0.1);//GameBaseData.instance.WaitForSecond_01;

        this.anim.gameObject.SetActive(true);
        this.anim.SetBool("IsPlay", false);
        this.isMoving = false;                                                                         // coroutine 종료
    }

    * OnCharacterMove(character : Transform)                                                           // charcter가 움직일 수 있게
    {
        let zepetoCharacter = character.gameObject.GetComponent<ZepetoCharacter>();
        while(true)
        {
            yield null;

            if(zepetoCharacter.CurrentState != CharacterState.Idle)
                character.GetComponent<CharacterController>().enabled = true;
            else
                character.GetComponent<CharacterController>().enabled = false;

            let distance = Vector3.Distance(character.position, this.anim.transform.position);
            if(distance > 3)
            {
                character.SetParent(null);
                character.gameObject.GetComponent<CharacterController>().enabled = true;
                this.StopCoroutine(this.OnCharacterMove(character));
                break;
            }
        }
    }
}