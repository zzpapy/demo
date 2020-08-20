<?php

namespace App\Controller\api;

use App\Entity\Comment;
use Symfony\Component\Security\Core\Security;


class CommentCreateController {

    public function __construct(Security $security){
        $this->security = $security;

    }
    
    public function __invoke(Comment $data){
        $data->setAuthor($this->security->getUser());
        dump($data);
        return $data;
    }
   

}