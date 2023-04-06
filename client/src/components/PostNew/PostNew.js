import { useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { postService, postEventEmitter } from "../../services/post.service";
import { useSelector } from 'react-redux';
import Star from "../PostForm/PostStar";
import moment from 'moment';
import { ValidateMsg, ErrorMsg } from "../Common/ValidateMsg";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
let classNames = require("classnames");
const FILE_MAX_SIZE = 100;
import "./PostNew.css";

function PostNew() {
    const [postTitle, setPostTitle] = useState("");
    const [postYear, setPostYear] = useState("");
    const [postTags, setPostTags] = useState("");
    const [postRating, setPostRating] = useState(0);
    const [postDesp, setPostDesp] = useState("");
    const [postImage, setPostImage] = useState(null);
    const [titleEmpty, setTitleEmpty] = useState(false);
    const [yearEmpty, setYearEmpty] = useState(false);
    const [tagsEmpty, setTagsEmpty] = useState(false);
    const [despEmpty, setDespEmpty] = useState(false);
    const [imageSizeErr, setImageSizeErr] = useState(false);
    const [imageTypeErr, setImageTypeErr] = useState(false);
    const [loading, setLoading] = useState(false);
    const [yearError, setYearError] = useState(false);
    const [titleLenLimit, setTitleLenLimit] = useState(false);
    const [tagsLenLimit, setTagsLenLimit] = useState(false);
    const [despLenLimit, setDespLenLimit] = useState(false);
    const msgSender = new postService();
    const navigate = useNavigate();
    const curYear = moment().year();
    const isLoggedOut = useSelector((state) => state.auth.isLoggedOut);

    useEffect(()=> {
        postEventEmitter.on("post_new_data", handlePostDataEvent);

        return () => {
            postEventEmitter.removeListener("post_new_data", handlePostDataEvent);
        }
    }, [])

    const handlePostDataEvent = (msg) => {
        // console.log("post: ", JSON.stringify(msg));
        setLoading(false);
        if (msg.error) {
            // error handling
            // setFetchError(true);
            // add an error toast with retry
            const Msg = ({ closeToast, toastProps }) => (
                <div>
                    <div className="toast-retry">
                        <span className="toast-text">Oops create failed</span>
                        <button className="toast-retry-button" onClick={() => { saveData(); closeToast() }}>Retry</button>
                    </div>
                </div>
            )
            toast.warn(Msg, {
                toastId: "create-warn-toast"
            });
        } else {
            // setFetchError(false);
            navigate("/post");
        }
    }

    const onInputChange = (event) => {
        let inputName = event.target.name;
        let inputValue = event.target.value;
        let inputMaxLen = event.target.maxLength;
        let inputNumMin = event.target.min;
        let inputNumMax = event.target.max;
        switch(inputName) {
            case "title":
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
            case "tags":
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
        let data = new FormData();
        data.append('title', postTitle);
        data.append('desp', postDesp);
        data.append('tags', postTags);
        data.append('rating', postRating);
        data.append('file', postImage);
        // console.log("form data: ", ...data);
        msgSender.saveNewPost(data);
        // record request for resend reference
        setLoading(true);
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
        return (Math.ceil(size / (1024 * 1024))) > FILE_MAX_SIZE; // file size is too large
    }

    const checkMimeType = (file_type) => {
        const types = ['image/png', 'image/jpeg', 'image/gif'];
        return (types.every((type) => type != file_type)); // file type doesn't match any type in types
    }

    const checkValidImage = (file) => {
        if (checkFileSize(file.size)) {
            return "size_err" ;
        } 

        if (checkMimeType(file.type)) {
            return "type_err";
        }

        return "";
    }

    const onFileChange = (event) => {
        // image validation
        if(event.target.files.length == 0) {
            return;
        } else {
            let file = event.target.files[0];
            let res = checkValidImage(file);            
            switch (res) {
                case "size_err":
                    setImageSizeErr(true);
                    break;
                case "type_err":
                    setImageTypeErr(true);
                    break;
                default:
                    setPostImage(file);
                    setImageSizeErr(false);
                    setImageTypeErr(false);
                    break;
            }
        }
    }

    const onDeleteFile = () => {
        setPostImage(null);
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
        let imageInfo;
        if (postImage != null) {
            imageInfo = (
                <div className="image-info">
                    <span>{postImage.name}</span>
                    <i className="fa-regular fa-circle-xmark" onClick={onDeleteFile}></i>
                </div>
            )
        }

        content = (
            <div className="post-new row">
                {/* <div className="post-image col-md-6">
                    <img src={columnImg} alt="col-img" />
                </div> */}
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

                        <div className="form-field file-field">
                            {/* <input className="choose-file-input" type="file" name="file" id="selectFile" onChange={onFileChange}></input> */}
                            <input type="file" name="file" id="selectFile" onChange={onFileChange} onClick={event => event.target.value = null} style={{ display: "none" }} />
                            <button className="btn btn-secondary" onClick={() => document.getElementById('selectFile').click()}>Choose File</button>
                            {imageInfo}
                            {imageSizeErr && 
                            <ErrorMsg
                                text="Image is too large, please upload a smaller one"
                            ></ErrorMsg>}
                            {imageTypeErr && 
                            <ErrorMsg
                                text={"File type is not supported format"}
                            ></ErrorMsg>}
                        </div>

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
        <div className="new-post-page">
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

export default PostNew;