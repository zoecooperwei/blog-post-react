import { useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import Searchbar from "../Common/Searchbar";
import { postService, postEventEmitter }from "../../services/post.service";
import { useSelector } from 'react-redux';
import './PostList.css';
import Star from "../PostForm/PostStar";
var classNames = require('classnames');
const PAGE_LIMIT = 6;
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PostCard from "../Common/Card";
import moment from "moment";

function Pagination(props) {
    let total = parseInt(props.totalPages);
    let current = parseInt(props.currentPage);
    let pageItems = [...Array(total)].map((_, index) => {
        let num = index+1;
        let isActive = num == current;
        let pageItemStyle = classNames(
            { "page-item": true },
            { "active": isActive },
            { "inactive": !isActive }
        )
        return (
            <div 
            key={index} 
            className={pageItemStyle} 
            onClick={() => isActive ? {} : goToPage(num)}
            >
                {num}
            </div>
        )
    })

    let showArrow = total > 1;

    const goToPage = (pageNum) => {
        localStorage.setItem("curPage", JSON.stringify(pageNum));
        props.loadPostList(pageNum);
    }

    let enableLeft = current > 1;
    let enableRight = current < total;

    let prevArrow = classNames(
        { "disable": !enableLeft },
        { "prev-arrow page-item": true }
    )

    let nextArrow = classNames(
        { "disable": !enableRight },
        { "next-arrow page-item": true }
    )

    return (
        <div className="paginate">
            {showArrow &&
            <div className={prevArrow} onClick={() => enableLeft ? goToPage(current-1) : {}}>
                <i className="fa-solid fa-angle-left"></i>
            </div>}
            {pageItems}
            {showArrow && 
            <div className={nextArrow} onClick={() => enableRight ? goToPage(current+1) : {}}>
                <i className="fa-solid fa-angle-right"></i>
            </div>}
        </div>
    )
}

function PostList() {
    const [searchString, setSearchString] = useState("");
    const [loading, setLoading] = useState(false);
    const [postList, setPostList] = useState([]);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [fetchError, setFetchError] = useState(false);
    const [viewOption, setViewOption] = useState("grid");
    const navigate = useNavigate();
    const msgSender = new postService();
    const isLoggedOut = useSelector((state) => state.auth.isLoggedOut);

    useEffect(() => {
        // component did mount: load post data
        postEventEmitter.on('post_list_data', handlePostListEvent);
        postEventEmitter.on('post_search_data', handleSearchEvent);
        postEventEmitter.on('post_delete_data', handleDeleteEvent);

        let curPage = localStorage.getItem("curPage");
        if(curPage) { // check if local data exists
            loadPostList(parseInt(JSON.parse(curPage)));
        } else { // non-exist: update local data and load to set state
            localStorage.setItem("curPage", JSON.stringify(1));
            loadPostList(1);
        };

        let view = localStorage.getItem("view");
        if(view) { // check if local data exists
            setViewOption(JSON.parse(view));
        } else { // non-exist: update local data and set state
            switchView("grid");
        };

        return () => {
            postEventEmitter.removeListener('post_list_data', handlePostListEvent);
            postEventEmitter.removeListener('post_search_data', handleSearchEvent);
            postEventEmitter.removeListener('post_delete_data', handleDeleteEvent);
        }
    }, []);

    const switchView = (option) => {
        // every time we switch the view, remember to update local storage
        localStorage.setItem("view", JSON.stringify(option));
        setViewOption(option);
    }

    const loadPostList = (pageNum) => {
        setLoading(true);
        msgSender.getPosts(pageNum, PAGE_LIMIT);
        // record request for resend reference
    }

    const handlePostListEvent = (msg) => {
        // console.log("post list: ", JSON.stringify(msg));
        if (msg.error) {
            // error handling
            setFetchError(true);
        } else {
            setPostList(msg.posts.data);
            setTotalPages(msg.posts.totalPages);
            setCurrentPage(msg.posts.currentPage);
            setLoading(false);
            setFetchError(false);
        }
    }

    const refresh = () => {
        loadPostList(currentPage);
    }

    const searchPost = (string) => {
        setLoading(true);
        if (string.length > 0) {
            msgSender.searchPost(string);
            // record request for resend reference
        } else {
            loadPostList(currentPage);
        }
    }

    const handleSearchEvent = (msg) => {
        // console.log("search: ", JSON.stringify(msg));
        if (msg.error) {
            // error handling
            setFetchError(true);
        } else {
            setPostList(msg.search_data.data);
            setLoading(false);
            setFetchError(false);
        }
    }

    const onSearch = (string) => {
        setSearchString(string);
        searchPost(string);
    }

    const createPost = () => {
        // nav to post form empty page
        navigate("/post/new");
    }

    const editPost = (post) => {
        // nav to post form page
        navigate(`/post/${post._id}`);
    }

    const handleDeleteEvent = (msg) => {
        // console.log("delete: ", JSON.stringify(msg));
        if (msg.error) {
            // toast warn
            const Msg = ({ closeToast, toastProps }) => (
                <div>
                    <div className="toast-retry">
                        <span className="toast-text">Oops delete failed, please retry</span>
                        {/* <button className="toast-retry-button" onClick={() => { deletePost(msg.postId) }}>Retry</button> */}
                    </div>
                </div>
            )
            toast.warn(Msg, {
                toastId: "delete-warn-toast"
            });
        } else {
            toast.success('Delete success!', {
                toastId: "delete-success-toast"
            });
            loadPostList(currentPage);
        }
    }

    const deletePost = (id) => {
        // send delete request to server
        msgSender.deletePost(id);
        // record request for resend reference
    }

    if (isLoggedOut) {
        return <Navigate to="/login" />
    }

    let isGridView = viewOption == "grid";
    let gridViewStyle = classNames(
        { "view-option": true },
        { "view-active": isGridView }
    );

    let isListView = viewOption == "list";
    let listViewStyle = classNames(
        { "view-option": true },
        { "view-active": isListView }
    );

    let postContent;
    let isSearchMode = searchString.length > 0;
    if (loading) {
        postContent = (
            <div className="loadingSpinner">
                <i className="fa-solid fa-circle-notch loading"></i>
            </div>
        )
    } else {
        if(fetchError) {
            postContent = (
                <div className="error-msg">
                    <span className="error-msg-info">Something goes wrong... Please try again</span>
                    <button className="btn btn-primary" onClick={refresh}>Refresh</button>
                </div>
            )
        } else {
            if (postList.length == 0) {
                let emptyMsg = isSearchMode ? "We could not find the result..." : "";
                if (isSearchMode) {
                    postContent = (
                        <div className="empty-msg">
                            <span className="empty-msg-info">We could not find the result...</span>
                            <button className="btn btn-secondary" onClick={refresh}>Refresh</button>
                        </div>
                    )
                } else {
                    postContent = (
                        <div className="empty-msg">
                            <span className="empty-msg-info">Seems we don't have any post here</span>
                            <button className="btn btn-secondary" onClick={createPost}>
                                <i className="fa-solid fa-plus" style={{ marginRight: "5px" }}></i>
                                New post
                            </button>
                        </div>
                    )
                }
            } else {
                if (isListView) {
                    let postRows = postList.map((post, index) => {
                        let time = moment(post.createdAt).fromNow();
                        return (
                            <tr key={index}>
                                <td>{post.title}</td>
                                {/* <td>{post.year}</td> */}
                                <td>{post.tags}</td>
                                <td>
                                    <Star
                                        rating={post.rating}
                                        disableClick={true}
                                    ></Star>
                                </td>
                                <td>{post.username}</td>
                                <td>{time}</td>
                                <td>
                                    <div className="action-btns">
                                        <div className="action-btn" onClick={() => editPost(post)} title="Edit">
                                            <i className="fa-solid fa-pen-to-square"></i>
                                        </div>
                                        <div className="action-btn" onClick={() => deletePost(post._id)} title="Delete">
                                            <i className="fa-solid fa-trash"></i>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        )
                    });

                    postContent = (
                        <div className="post-content">
                            <table className="post-table" cellSpacing="0">
                                <thead>
                                    <tr role="row">
                                        <th className="sorting" rowSpan="1" colSpan="1">Title</th>
                                        {/* <th className="sorting" rowSpan="1" colSpan="1">Year</th> */}
                                        <th className="sorting" rowSpan="1" colSpan="1">Tags</th>
                                        <th className="sorting" rowSpan="1" colSpan="1">Mood</th>
                                        <th className="sorting" rowSpan="1" colSpan="1">Created by</th>
                                        <th className="sorting" rowSpan="1" colSpan="1">Updated</th>
                                        <th className="sorting" rowSpan="1" colSpan="1">Action</th>
                                    </tr>
                                </thead>
                                <tbody>    
                                    {postRows}        
                                </tbody>
                            </table>
                            {!isSearchMode &&
                            <Pagination
                                totalPages={totalPages}
                                currentPage={currentPage}
                                loadPostList={loadPostList}
                            ></Pagination>}
                        </div>
                    )
                } else {
                    let cardRows = postList.map((post, index) => {
                        return (
                            <PostCard
                                key={index}
                                data={post}
                                showRating={true}
                                isGrid={true}
                                editPost={editPost}
                                deletePost={deletePost}
                            ></PostCard>
                        )
                    });
                    postContent = (
                        <div className="post-list-cards">
                            <div className="row">
                                {cardRows}
                            </div>
                            {!isSearchMode &&
                            <Pagination
                                totalPages={totalPages}
                                currentPage={currentPage}
                                loadPostList={loadPostList}
                            ></Pagination>}
                        </div>
                    )
                }
            }
        }
    };

    return (
        <div className="post-list container">
            <div className="post-list-header">    
                <div className="post-search">
                    <Searchbar
                        className="post-search-bar"
                        placeholder="Search"
                        handleSearch={onSearch}
                        searchString={searchString}
                        asYouType={true}
                    ></Searchbar>
                </div>  
                <div className="post-controls">
                    <div className="view-options">
                        <div className={gridViewStyle} onClick={() => switchView("grid")}>
                            <i className="fa-solid fa-grip"></i>
                        </div>
                        <div className={listViewStyle} onClick={() => switchView("list")}>
                            <i className="fa-solid fa-list"></i>
                        </div>
                    </div>  
                    <div className="add-new" title="Add new post">
                        <i className="fa-solid fa-plus"></i>
                        <button className="add-new-btn" onClick={createPost}>
                            Add new
                        </button>
                    </div>  
                </div>  
            </div>
            {postContent}
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

export default PostList;