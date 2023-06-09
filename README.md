# blog-post MERN app
• Login page
![login](https://user-images.githubusercontent.com/42746063/232567496-87da0a91-bf52-4948-bc62-06bba8c9a525.png)

• Home page (fresh user)
![initial_home](https://user-images.githubusercontent.com/42746063/232568760-feb53c70-5305-4a15-8b89-fd736f52ba38.png)

## Client side 

• Login process with access token and refresh token.
1. Register form to create a new account.
2. Login form with authentication and authorization.
3. Form validation and invalid login error notification.

• Responsive Layout and React-bootstrap carousel.

• React Router Navigation.

• Post Management.
1. Add a new blog with post details.
2. Edit the existing blog post information about the title, the content, the mood, the background image.
3. Obtain the blog post information via searching by title / content.
4. Delete an existing blog post.
5. Save the new or modiﬁed post data.
• Reactive Form Validation.
1. required validator.
2. minLength validator.

• Image uploading.
1. Multer as middleware to access the image and form data.
2. Google CS (Cloud Storage) with cloud bucket and service account key (JSON).
3. Google KMS (Key management service) - In progress.

• Notification.
1. React toastify library implementation.
2. Different notification messages in terms of different post operations and errors.

• HTTP request handler
1. Auth service - register, login, refreshToken, logout, getUserData, response data handling
2. User service - Create, Edit/Update, Delete, Search
3. Front-end development and Service decouple - Node event emitter Pub-Sub pattern
4. Redux - logout: notify all components
5. Access Token header - when user wants to access protected resources
6. Refresh Token header - when access token expires

• Services (HTTP service, Storage service)
1. Auth service
2. User post service: Interceptor middleware for http request and response with token
4. Local Storage service

## Server side achievement

• Private API and Data Display.
1. A mock server with RESTful API built in nodeJS, expressJS.
2. MongoDB for data storage and manipulation. (CRUD operations)
3. Deploy with Heroku providing remote server as back-end reliable service.

• Authentication and Authorization controller.

• Access token verification, Refresh token verification.

JWT token verity api, refresh rotation strategy: issue new access token and new refresh token

• User controller: getPosts, searchPost, updatePost, postPost, deletePost.

## Step Description

The steps to reach the movie favorites app are described as follows:

• Enter https://blog-post-react.herokuapp.com/ in the address bar, redirect to the login/homepage.

• Click Register here to create a new account for fresh user.
![register](https://user-images.githubusercontent.com/42746063/232567700-bfb4bf06-1f1a-4ced-b3bd-0cdae45a5384.png)

• Enter existing username and password for existing user. 

• Click Home link, go to the homepage.

• Click Post link, go to the post page.

• Click view button to switch between list view and card view.

• Click pagination bar to browse post pages.

• Click edit button, go to the post info page and edit the post information.

• Click delete button, remove the post.

• Click New button, go to the blank post info page and add new post.

• Search post name/content, click search button, go to the post info page directly instead of looking for it in the post list.

• Click Save button, save post data and go back to the post page.

• Click Back button, go back to the post page directly.

• Form validation when editing the post information.
