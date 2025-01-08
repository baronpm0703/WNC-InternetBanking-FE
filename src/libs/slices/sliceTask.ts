import { Task } from "../../component/task";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getCacheToken } from "../../helper/cacheToken";

const destination_server = "http://localhost:3000";

export const fakeDb = [
    { id: 1, title: "Task 1", description: "Description 1", status: true },
    { id: 2, title: "Task 2", description: "Description 2", status: true },
    { id: 3, title: "Task 3", description: "Description 3", status: true },
    { id: 4, title: "Task 4", description: "Description 4", status: true },
];

interface TaskState {
    allTask: Task[];
    isOpenDialog: boolean;
    currentTaskList: Task[];
    isShowAddTask: boolean;
    isOpenDetailDialog: boolean;
    isOpenEmployeeCreateDialog: boolean;
    isOpenDeleteEmployeeDialog: boolean;
    loading: boolean;
    isRepayModalOpen: boolean;
    isCancelDebtModalOpen: boolean;
}
const initialState: TaskState = {
    allTask: [],
    isOpenDialog: false,
    isOpenDetailDialog: false,
    currentTaskList: [],
    isOpenEmployeeCreateDialog: false,
    isOpenDeleteEmployeeDialog: false,
    isShowAddTask: false,
    loading: false,
    isRepayModalOpen: false,
    isCancelDebtModalOpen: false
};

export const insertOne = createAsyncThunk(
    'auth/submit',
    async (taskInfo: { title: string, description: string }, { rejectWithValue }) => {
        let body = JSON.stringify(taskInfo);
        let token = getCacheToken();
        console.log("Token: ", token);
        let response = await fetch(`${destination_server}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body,
        });
        let data = await response.json();
        let { task_id, ...rest } = data;
        if (response.ok) {
            return { id: task_id, ...rest };
        } else {
            return rejectWithValue("Failed to insert new task");
        }
    }
)
export const loadAll = createAsyncThunk(
    'auth/loadAll',
    async (_, { rejectWithValue }) => {
        let token = getCacheToken();
        console.log("Token: ", token);
        let response = await fetch(`${destination_server}/tasks`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            }
        });
        let data = await response.json();
        data = data.map((task: any) => {
            return { ...task, id: task.task_id };
        })
        if (response.ok) {
            return data;
        } else {
            return rejectWithValue("Failed to load all task");
        }
    }
)
export const updatedStatusTask = createAsyncThunk(
    'auth/updatedTask',
    async (taskInfo: { id: number, status: boolean }, { rejectWithValue }) => {
        let { id, ...body } = taskInfo;
        let token = getCacheToken();
        let response = await fetch(`${destination_server}/tasks/status/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        });
        let data = await response.json();
        let { task_id, ...rest } = data;
        if (response.ok) {
            return { id: task_id, ...rest };
        } else {
            return rejectWithValue("Failed to update status new task");
        }
    }
)
export const sliceTask = createSlice({
    name: "task",
    initialState,
    reducers: {
        showAll: (state) => {
            state.isShowAddTask = !state.isShowAddTask;
            let { isShowAddTask, allTask } = state;
            state.currentTaskList = isShowAddTask ? allTask : [];
        },
        addTask: (state, action) => {
            let { title, description } = action.payload;
            const newTask: Task = {
                id: state.allTask[state.allTask.length - 1]?.id + 1 || 1,
                title: title || "No title",
                description: description || "No description",
                status: false,
            };
            state.allTask.push(newTask);
            state.currentTaskList.push(newTask);
            console.log("Add new task", newTask);
        },
        updateOneTask: (state, action) => {
            let { index } = action.payload;
            let updatedTasks = [...state.allTask];
            updatedTasks[index].status = !updatedTasks[index].status;
            state.allTask = updatedTasks;
            state.currentTaskList = updatedTasks;

            console.log("Update task", updatedTasks[index]);
        },
        filterTasks: (state, action) => {
            let { value } = action.payload;
            let filteredData = state.allTask.filter(
                (task) =>
                    task.title.toLowerCase().includes(value.toLowerCase()) ||
                    task.description.toLowerCase().includes(value.toLowerCase())
            );
            state.currentTaskList = filteredData;
            console.log("Filter task", filteredData);
        },
        openDialog: (state) => {
            state.isOpenDialog = !state.isOpenDialog;
        },
        interactDialog: (state, action) => {
            console.log("Interact dialog", action.payload);
            state.isOpenDialog = action.payload;
        },
        openDetailDialog: (state) => {
            state.isOpenDetailDialog = !state.isOpenDialog;
        },
        interactDetailDialog: (state, action) => {
            console.log("Interact detail dialog", action.payload);
            state.isOpenDetailDialog = action.payload;
        },
        openEmployeeCreateDialog: (state) => {
            state.isOpenEmployeeCreateDialog = !state.isOpenEmployeeCreateDialog;
        },
        interactEmployeeCreateDialog: (state, action) => {
            console.log("Interact employee create dialog", action.payload);
            state.isOpenEmployeeCreateDialog = action.payload;
        },
        openDeleteEmployeeDialog: (state) => {
            state.isOpenDeleteEmployeeDialog = !state.isOpenDeleteEmployeeDialog;
        },
        interactDeleteEmployeeDialog: (state, action) => {
            console.log("Interact delete employee dialog", action.payload);
            state.isOpenDeleteEmployeeDialog = action.payload
        },
        openRepayModal: (state) => {
            state.isRepayModalOpen = true; 
        },
        openCancelDebtModal: (state) => {
            state.isCancelDebtModalOpen = true; 
        },
        closeCancelDebtModal: (state) => {
            state.isCancelDebtModalOpen = false;
        },
        closeRepayModal: (state) => {
            state.isRepayModalOpen = false; // Tắt modal trả nợ
        },
        interactRepayModal: (state, action) => {
            state.isRepayModalOpen = action.payload.isOpen;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loadAll.pending, (state) => {
                state.loading = true;
            })
            .addCase(loadAll.rejected, (state, action) => {
                state.loading = false;
                console.log("Failed to load all task", action.payload);
            })
            .addCase(loadAll.fulfilled, (state, action) => {
                state.loading = false;
                state.allTask = action.payload;
                state.currentTaskList = action.payload;
            })
            .addCase(insertOne.pending, (state) => {
                state.loading = true;
            })
            .addCase(insertOne.fulfilled, (state, action) => {
                state.loading = false;
                state.allTask.push(action.payload);
                state.currentTaskList.push(action.payload);
                console.log("Add new task", action.payload);
            })
            .addCase(insertOne.rejected, (state, action) => {
                state.loading = false;
                console.log("Failed to insert new task", action.payload);
            })
            .addCase(updatedStatusTask.pending, (state) => {
                state.loading = true;
            })
            .addCase(updatedStatusTask.fulfilled, (state, action) => {
                state.loading = false;
                let updatedTasks = [...state.allTask];
                let index = updatedTasks.findIndex((task) => task.id === action.payload.id);
                updatedTasks[index] = action.payload;
                state.allTask = updatedTasks;
                state.currentTaskList = updatedTasks;
                console.log("Update task", state.allTask);
            })
            .addCase(updatedStatusTask.rejected, (state, action) => {
                state.loading = false;
                console.log("Failed to update task", action.payload);
            })
    }
})

export const { showAll, addTask, updateOneTask, filterTasks, openDialog, interactDialog, openDetailDialog, interactDetailDialog, interactDeleteEmployeeDialog, interactEmployeeCreateDialog, openEmployeeCreateDialog, openDeleteEmployeeDialog, openRepayModal, interactRepayModal, closeRepayModal, openCancelDebtModal, closeCancelDebtModal } = sliceTask.actions;
export const taskReducer = sliceTask.reducer;