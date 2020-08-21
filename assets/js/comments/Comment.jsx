import {render, unmountComponentAtNode} from 'react-dom'
import React, { useEffect,useRef,useState, useCallback } from 'react'
import { usePaginatedFetch, useFetch } from './hooks'
import {Icon} from '../components/Icon'
import {Field} from '../components/Form'

const VIEW = "VIEW"
const EDIT = "EDIT"
const dateFormat = {
     dateStyle: "medium",
     timestyle: "short"
 }
function Title({count}){
    return <h3>
        <Icon icon="comments" />
        {count} Commentaire{count > 1 ? 's': ''} </h3>
}

function Comments({post,user}){
    const {items : comments,setItems: setComments, load,loading,setCount, count,hasMore} = usePaginatedFetch('/api/comments?post='+post)
    console.log(count)
    const addComment = useCallback(comment => {
        setComments(comments => [comment,...comments])
        // count++
        setCount(count + 1)
        console.log(count,"eeee")
    },[count])
    const deleteComment = useCallback(comment => {
        setComments(comments => comments.filter(c => c !== comment))
        setCount(count - 1)
        console.log(count,"eeee")
    },[count])
    const updateComment = useCallback((newComment, oldComment) => {
        setComments(comments => comments.map(c => c === oldComment ? newComment : c))
        setCount(count - 1)
        console.log(count,"eeee")
    },[count])
    useEffect(() =>{
        load()

    },[])
    return <div>
        <Title count={count} />
        {user && <CommentForm post={post.post} onComment={addComment}/>}
        
        {comments.map((comment, index) => <Comment 
                                key={comment.id} 
                                comment={comment} 
                                canEdit={comment.author.id === user}
                                onDelete={deleteComment}
                                onUpdate={updateComment}
                                />)}
        {hasMore && <button disabled={loading} className="btn btn-primary" onClick={load}>Charger plus de commentaires</button>}
    </div>
}
const Comment = React.memo(({comment,canEdit, onUpdate,onDelete}) => {
    const[state, setState] = useState(VIEW)
    const toggleEdit =useCallback(() => {
        setState(state => state === VIEW ? EDIT : VIEW)
    },[])
    const onComment = useCallback((newComment) => {
        onUpdate(newComment, comment)
        toggleEdit()
    },[comment])
    const date =  new Date(comment.publishedAt)
    const onDeleteCallback = useCallback(() =>{
        onDelete(comment)
    },[comment])
    const {loading : loadingdelete, load : callDelete} = useFetch(comment["@id"],"DELETE", onDeleteCallback)
    return <div className="row post-comment">
        <h4 className="col-sm-3">
            <strong>{comment.author.username}</strong>
            commenté le 
            <strong>{date.toLocaleString(undefined, dateFormat)}</strong>
        </h4>
        <div className="col-sm-9">
            {state === VIEW ?
            <p>{comment.content}</p> :
            <CommentForm comment={comment} onComment={onComment} onCancel={toggleEdit}/>
            }
            {(canEdit && state !== EDIT) && <p>
                <button className="btn btn-danger" onClick={callDelete.bind(this, null)} disabled={loadingdelete}>
                    <Icon icon="trash" /> Supprimer
                </button>
                <button className="btn btn-secondary" onClick={toggleEdit}>
                    <Icon icon="pen" /> Editer
                </button>
                </p>}
        </div>
    </div>
}) 
const CommentForm = React.memo(({post = null, onComment, comment = null, onCancel = null}) => {
    const ref = useRef(null)
    const onSuccess = useCallback(comment => {
        console.log(comment,'gggggg')
        onComment(comment)
        ref.current.value = ""
       
    },[ref, onComment])
    const method= comment ? 'PUT' : 'POST'
    const url = comment ?comment["@id"] : "api/comments"
    const {load, loading, errors, clearError} = useFetch(url, method, onSuccess)
    const onSubmit = useCallback(e => {
        e.preventDefault()
        load({
            content : ref.current.value,
            post : "/api/posts/"+post
        }, [load, ref, post])
    })
    useEffect(() => {
        if(comment && comment.content && ref.current){
            ref.current.value = comment.content
        }
    }, [comment, ref])
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
                    <Icon icon="paper-plane" /> {comment === null ? "Envoyer" : "Editer"}
                </button>
                {onCancel && <button className="btn btn-secondary" onClick={onCancel}>
                    Annuler
                    </button>}
            </div>
        </form>

    </div>
})

class CommentsElement extends HTMLElement{
    connectedCallback(){
        const post = parseInt(this.dataset.post,10)
        const user = parseInt(this.dataset.user,10) || null
        console.log(post,"tata")
        render( <Comments  post={post} user={user} />,this)
    }
    disconnectedCallback(){
        unmountComponentAtNode(this)
    }
}

customElements.define('post-comments',CommentsElement)