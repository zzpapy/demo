<?php

 namespace App\Controller\api;

use Symfony\Component\BrowserKit\Response;

class EmptyController{

    public function __invoke()
    {
        return new Response(); 
    }
 }