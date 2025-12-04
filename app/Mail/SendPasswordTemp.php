<?php

namespace App\Mail;

use Illuminate\Mail\Mailables\Address;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SendPasswordTemp extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public string $senhaTemp;
    public string $nome;
    public string $usuarioRede;
    public function __construct(string $senha, string $nome, string $usuarioRede)
    {
        $this->senhaTemp = $senha;
        $this->nome = $nome;
        $this->usuarioRede = $usuarioRede;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address(env('MAIL_FROM_ADDRESS'), env('MAIL_FROM_NAME')),
            subject: 'Senha temporária',

        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emailbody',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
