import {render, unmountComponentAtNode} from 'react-dom'
import React, { useEffect,useRef,useState, useCallback } from 'react'
import { usePaginatedFetch, useFetch } from './hooks'
import {Icon} from '../components/Icon'
import {Field} from '../components/Form'


const dateFormat = {
     dateStyle: "medium",
     timestyle: "short"
 }
function Title({count}){
    return <h3>
        <Icon icon="comments" />
        {count} Commentaire{count > 1 ? 's': ''} </h3>
}

function Comments(post,user){
    const {items : comments,setItems: setComments, load,loading,count,hasMore} = usePaginatedFetch('/api/comments?post='+post.post)
    const addComment = useCallback(comment => {
        console.log(comment)
        setComments(comments => [comment,...comments])
    },[])
    useEffect(() =>{
        load()
    },[])
    return <div>
        <Title count={count}/>
        {post.user && <CommentForm post={post.post} onComment={addComment}/>}
        {comments.map(comment => <Comment key={comment.id} comment={comment} />)}
        {hasMore && <button disabled={loading} className="btn btn-primary" onClick={load}>Charger plus de commentaires</button>}
    </div>
}
const Comment = React.memo(({comment}) => {
    const date =  new Date(comment.publishedAt)
    return <div className="row post-comment">
        <h4 className="col-sm-3">
            <strong>{comment.author.username}</strong>
            commenté le 
            <strong>{date.toLocaleString(undefined, dateFormat)}</strong>
        </h4>
        <div className="col-sm-9">
            <p>{comment.content}</p>
        </div>
    </div>
}) 
const CommentForm = React.memo(({post, onComment}) => {
    const ref = useRef(null)
    const onSuccess = useCallback(comment => {
        console.log(comment,'gggggg')
        onComment(comment)
        ref.current.value = ""
    },[ref, onComment])
    const {load, loading, errors,clearError} = useFetch("/api/comments", "POST", onSuccess)
    const onSubmit = useCallback(e => {
        e.preventDefault()
        load({
            content : ref.current.value,
            post : "/api/posts/"+post
        }, [load, ref, post])
    })
    return <div>
        <form onSubmit={onSubmit}>
            <fieldset>
                <legend>
                    <Icon icon="comment" />Laisser un commentaire.
                </legend>
            </fieldset>
           <Field 
                name="content" 
                ref={ref} 
                error={errors["content"]}
                onChange={clearError.bind(this,"content")}
                help="Les commentaires non confotmes à notre code de conduite seront modérés."
                >
                Votre commentaire</Field>
            <div className="form-group">
                <button className="btn btn-primary" disabled={loading}>
                    <Icon icon="paper-plane" /> Envoyer
                </button>
            </div>
        </form>

    </div>
})

class CommentsElement extends HTMLElement{
    connectedCallback(){
        const post = parseInt(this.dataset.post,10)
        const user = parseInt(this.dataset.user,10) || null
        render( <Comments key={post.post} post={post} user={user} />,this)
    }
    disconnectedCallback(){
        unmountComponentAtNode(this)
    }
}

customElements.define('post-comments',CommentsElement)