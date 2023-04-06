import { createSlice } from '@reduxjs/toolkit';

export const authSlice = createSlice({
    name: 'auth',
    initialState: {
        isLoggedOut: false
    },
    reducers: {
        logout: (state, action) => {
            state.isLoggedOut = action.payload;
        }
    }
})

/**
 * export variable:
 * 1. can export several values
 * 2. the naming of import should be the same name of export
 */
export const { logout } = authSlice.actions; 
/** 
 * default export variable:   
 * 1. it's the main exported value
 * 2. the naming of import could be any name
 * 3. only one default export per one module/file
*/
export default authSlice.reducer; 