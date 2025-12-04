<?php
namespace App\Services;
use App\Mail\SendPasswordTemp;
use Mail;
class SendEmail {
    public function __construct($email,$senhaTemp, $nome, $usuarioRede) {
        $this->sendEmaill($email,$senhaTemp, $nome, $usuarioRede );
    }
    public function sendEmaill($email, $senhaTemp, $nome, $usuarioRede){
        return
        Mail::to($email)->send(new SendPasswordTemp($senhaTemp??'senha teste', $nome, $usuarioRede));
    }
}