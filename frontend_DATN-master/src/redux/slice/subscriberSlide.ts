import { callFetchSubscriber } from "@/config/api";
import { ISubscriber } from "@/types/backend";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface IState {
    isFetching: boolean;
    meta: {
        current: number;
        pageSize: number;
        pages: number;
        total: number;
    },
    result: ISubscriber[]
}

export const fetchSubscriber = createAsyncThunk(
    'subscriber/fetchSubscriber',
    async ({ query }: { query: string }) => {
        const response = await callFetchSubscriber(query);
        return response;
    }
);

const initialState: IState = {
    isFetching: true,
    meta: {
        current: 1,
        pageSize: 10,
        pages: 0,
        total: 0
    },
    result: []
};

export const subscriberSlide = createSlice({
    name: 'subscriber',
    initialState,
    // The `reducers` field lets us define reducers and generate associated actions
    reducers: {
        // Use the PayloadAction type to declare the contents of `action.payload`
        setActiveMenu: (state, action) => {
            // state.activeMenu = action.payload;
        },


    },
    extraReducers: (builder) => {
        // Add reducers for additional action types here, and handle loading state as needed
        builder.addCase(fetchSubscriber.pending, (state, action) => {
            state.isFetching = true;
            // Add subscriber to the state array
            // state.courseOrder = action.payload;
        })

        builder.addCase(fetchSubscriber.rejected, (state, action) => {
            state.isFetching = false;
            // Add subscriber to the state array
            // state.courseOrder = action.payload;
        })

        builder.addCase(fetchSubscriber.fulfilled, (state, action) => {
            if (action.payload && action.payload.data) {
                state.isFetching = false;
                state.meta = action.payload.data.meta;
                state.result = action.payload.data.result;
            }
            // Add subscriber to the state array

            // state.courseOrder = action.payload;
        })
    },

});

export const {
    setActiveMenu,
} = subscriberSlide.actions;

export default subscriberSlide.reducer;