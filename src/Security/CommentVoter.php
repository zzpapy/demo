<?php

namespace App\Security;

use App\Entity\User;
use App\Entity\Comment;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;
use Symfony\Component\Security\Core\Authorization\Voter\VoterInterface;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;

class CommentVoter extends Voter
{
    const EDIT = 'EDIT_COMMENT';
    protected function supports(string $attribute, $subject){
        return 
            $attribute == self ::EDIT &&
            $subject instanceof Comment;
    }
    protected function voteOnAttribute(string $attribute, $subject, TokenInterface $token)
    {
        $user = $token->getUser();
        if(!$user instanceof User || !$subject instanceof Comment){
            return false;
        }
        return $subject->getAuthor()->getId() === $user->getId();
    }
   
}