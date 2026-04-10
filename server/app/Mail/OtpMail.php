<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class OtpMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $otp;
    public string $movieTitle;

    public function __construct(string $otp, string $movieTitle)
    {
        $this->otp        = $otp;
        $this->movieTitle = $movieTitle;
    }

    public function build(): self
    {
        return $this
            ->subject('Your CineBook OTP Code')
            ->view('emails.otp');
    }
}