// can get current page url's params, such as postId
import { useNavigate, useParams, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { postService, postEventEmitter } from "../../services/post.service";
import { useSelector } from 'react-redux';
import moment from 'moment';
import './PostForm.css';
import Star from "./PostStar";
import { ValidateMsg, ErrorMsg } from "../Common/ValidateMsg";
let classNames = require("classnames");
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import columnImg from "../../assets/decorate.jpeg";
const FILE_MAX_SIZE = 100;

function PostForm(props) {
    const [postTitle, setPostTitle] = useState("");
    const [postYear, setPostYear] = useState("");
    const [postTags, setPostTags] = useState("");
    const [postRating, setPostRating] = useState(0);
    const [postDesp, setPostDesp] = useState("");
    const [postImage, setPostImage] = useState(null);
    const [postImageSrc, setPostImageSrc] = useState("");
    const [titleEmpty, setTitleEmpty] = useState(false);
    const [yearEmpty, setYearEmpty] = useState(false);
    const [tagsEmpty, setTagsEmpty] = useState(false);
    const [despEmpty, setDespEmpty] = useState(false);
    const [fetchError, setFetchError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [yearError, setYearError] = useState(false);
    const [titleLenLimit, setTitleLenLimit] = useState(false);
    const [tagsLenLimit, setTagsLenLimit] = useState(false);
    const [despLenLimit, setDespLenLimit] = useState(false);
    const navigate = useNavigate();
    const { id } = useParams();
    const curYear = moment().year();
    const msgSender = new postService();
    const isLoggedOut = useSelector((state) => state.auth.isLoggedOut);

    useEffect(()=> {
        postEventEmitter.on("post_get_data", handlePostDataEvent);
        postEventEmitter.on("post_update_data", handlePostDataUpdateEvent);
        loadPostData();

        return () => {
            postEventEmitter.removeListener("post_get_data", handlePostDataEvent);
            postEventEmitter.removeListener("post_update_data", handlePostDataUpdateEvent);
        }
    }, [])

    const handlePostDataEvent = (msg) => {
        // console.log("get: ", JSON.stringify(msg));
        if (msg.error) {
            // error handling
            setFetchError(true);
        } else {
            let post = msg.post.data;
            setPostTitle(post.name);
            setPostRating(post.rating);
            setPostTags(post.tags);
            setPostDesp(post.desp);
            if (post.image) {
                setPostImageSrc(post.image.url);
            }
            setLoading(false);
            setFetchError(false);
        }
    }

    const handlePostDataUpdateEvent = (msg) => {
        // console.log("update: ", JSON.stringify(msg));
        if (msg.error) {
            // error handling
            setFetchError(true);
            const Msg = ({ closeToast, toastProps }) => (
                <div>
                    <div className="toast-retry">
                        <span className="toast-text">Oops update failed</span>
                        <button className="toast-retry-button" onClick={() => { saveData(); closeToast() }}>Retry</button>
                    </div>
                </div>
            )
            toast.warn(Msg, {
                toastId: "update-warn-toast"
            });
        } else {
            let post = msg.post.data;
            setPostTitle(post.name);
            setPostRating(post.rating);
            setPostTags(post.director);
            setPostYear(post.year);
            setPostDesp(post.desp);
            if (post.image.length > 0) {
                // console.log(post.image[0].data);
                // console.log("data: ", post.image.data.toString("base64"));
                // setPostImage(post.image);
                setPostImageSrc(post.image[0].data);
            }
            setFetchError(false);
            toast.success('Updated success!', {
                toastId: "update-success-toast"
            });
        }
    }

    const loadPostData = () => {
        setLoading(true);
        msgSender.getPost(id);
    }

    const refresh = () => {
        loadPostData();
    }

    const onInputChange = (event) => {
        let inputName = event.target.name;
        let inputValue = event.target.value;
        let inputMaxLen = event.target.maxLength;
        let inputNumMin = event.target.min;
        let inputNumMax = event.target.max;
        switch(inputName) {
            case "name":
                setPostTitle(inputValue);
                setTitleLenLimit(inputValue.length == inputMaxLen);
                setTitleEmpty(inputValue == "");
                break;
            case "year":
                setPostYear(inputValue);
                if (((Number(inputValue) >= Number(inputNumMin)) && (Number(inputValue) <= Number(inputNumMax)))
                || inputValue == "") {
                    setYearError(false);
                } else {
                    setYearError(true);
                };
                setYearEmpty(inputValue == "");
                break;
            case "director":
                setPostTags(inputValue);
                setTagsLenLimit(inputValue.length == inputMaxLen);
                setTagsEmpty(inputValue == "");
                break;
            default:
                break;
        }
    }

    const onRatingChange = (rating) => {
        setPostRating(rating);
    }

    const onDespChange = (event) => {
        setPostDesp(event.target.value);
        setDespLenLimit(event.target.value.length == event.target.maxLength);
        setDespEmpty(event.target.value == "");
    }

    const saveData = () => {
        msgSender.updatePost(id, postTitle, postDesp, postTags, postRating);
        // record request for resend reference
    }

    const backToPrev = () => {
        navigate("/post");
    }

    const getSizeForDisplay = (rawSizeInBytes) => {
        var BYTES_PER_KB = 1024;
        var BYTES_PER_MB = BYTES_PER_KB*BYTES_PER_KB;
        if (rawSizeInBytes < BYTES_PER_KB) {
            return (Math.ceil(rawSizeInBytes * 10.0 / BYTES_PER_KB) / 10.0) + " K";
        } else if (rawSizeInBytes < BYTES_PER_MB) {
            return Math.ceil(rawSizeInBytes / 1024.0) + " K";
        } else {
            return (Math.ceil(rawSizeInBytes * 10.0 / BYTES_PER_MB) / 10.0) + " M";
        }
    }

    const checkFileSize = (size) => {
        return (size / (1024 * 1024)).toFixed(2);
    }

    const onFileChange = (event) => {
        // limit to image file
        if(event.target.files.length == 0) {
            return;
        } else {
            let file = event.target.files[0];
            let size_in_mb = checkFileSize(file.size);
            if ((size_in_mb) > FILE_MAX_SIZE) {
                // TODO: toastify
            } else {
                setPostImage(file);
            }
        }
    }

    if (isLoggedOut) {
        return <Navigate to="/login" />
    }

    let hasEmptyField = postTitle == "" || postDesp == "" || postTags == "" || postRating == 0 || postImage == null;
    let hasErrorField = titleLenLimit || despLenLimit || tagsLenLimit;
    let disableSave = hasEmptyField || hasErrorField;
    let saveStyle = classNames(
        { "form-save-btn": true },
        { "disable-save": disableSave }
    )

    let content;
    if (loading) {
        content = (
            <div className="loadingSpinner">
                <i className="fa-solid fa-circle-notch loading"></i>
            </div>
        )
    } else {
        let hasImage = postImageSrc != "";
        content = (
            <div className="post-edit row">
                <div className="post-image col-md-12 col-sm-12">
                    {hasImage && <img className="form-image" src={postImageSrc} alt="image" />}
                    {!hasImage && <img src={columnImg} alt="col-img" />}
                </div>
                <div className="post-form col-md-12 col-sm-12">
                    <div className="post-form-content">
                    <div className="form-field">
                            <div className="input-label special-label">Post title</div>
                            <input 
                                className="post-input"
                                value={postTitle}
                                name="title"
                                onChange={onInputChange}
                                placeholder="Title"
                                type="text"
                                autoFocus
                                maxLength={25}
                            ></input>
                            {titleEmpty && 
                            <ValidateMsg
                                fieldName="post title"
                            ></ValidateMsg>
                            }
                            {titleLenLimit && 
                            <ErrorMsg
                                text="Please enter shorter title"
                            ></ErrorMsg>}
                        </div>

                        {/* <div className="form-field">
                            <div className="input-label special-label">Post year</div>
                            <input 
                                className="post-input"
                                value={postYear}
                                name="year"
                                type="number"
                                min={1}
                                max={curYear}
                                onChange={onInputChange}
                                placeholder="Year"
                            ></input>
                            {yearEmpty && 
                            <ValidateMsg
                                fieldName="post year"
                            ></ValidateMsg>}
                            {yearError && 
                            <ErrorMsg
                                text="Please enter valid year"
                            ></ErrorMsg>}
                        </div> */}

                        <div className="form-field">
                            <div className="input-label special-label">Post content</div>
                            <textarea 
                                className="post-textarea"
                                value={postDesp}
                                name="postDesp"
                                onChange={onDespChange}
                                placeholder="Content"
                                maxLength={100}
                            ></textarea>
                            {despEmpty && 
                            <ValidateMsg
                                fieldName="content"
                            ></ValidateMsg>}
                            {despLenLimit && 
                            <ErrorMsg
                                text="Maximum is reached"
                            ></ErrorMsg>}
                        </div>

                        <div className="form-field">
                            <div className="input-label special-label">Post tags</div>
                            <input 
                                className="post-input"
                                value={postTags}
                                name="tags"
                                onChange={onInputChange}
                                placeholder="Tags"
                                maxLength={25}
                            ></input>
                            {tagsEmpty && 
                            <ValidateMsg
                                fieldName="post tags"
                            ></ValidateMsg>}
                            {tagsLenLimit && 
                            <ErrorMsg
                                text="Maximum is reached"
                            ></ErrorMsg>}
                        </div>

                        <div className="form-field">
                            <div className="input-label">How is your mood today? </div>
                            <Star
                                onRatingChange={onRatingChange}
                                rating={postRating}
                            ></Star>
                        </div>

                        {/* <div className="form-field">
                            <input type="file" name="file" id="selectFile" onChange={onFileChange}></input>
                            <button onClick={uploadFile}>Upload</button>
                        </div> */}

                        <div className="form-actions">
                            <div className={saveStyle} onClick={() => disableSave ? {} : saveData()}>
                                Save
                            </div>
                            <div className="form-back-btn" onClick={backToPrev}>
                                Back
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="edit-post-page">
            {content}
            <ToastContainer
                position="bottom-center"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            ></ToastContainer>
        </div>
    )
}

export default PostForm;