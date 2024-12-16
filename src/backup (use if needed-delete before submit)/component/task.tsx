import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "../libs/hooks";
import { addTask, filterTasks, insertOne, loadAll, showAll, updatedStatusTask, updateOneTask } from "../libs/slices/sliceTask";

export interface Task {
    id: number;
    title: string;
    description: string;
    status: boolean;
}

interface AddTaskFormInputs {
    title: string;
    description: string;
}

const Tasks = () => {
    const dispatch = useAppDispatch();
    const { currentTaskList } = useAppSelector((state) => state.task);
    const [isAddTask, setIsAddTask] = useState<boolean>(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<AddTaskFormInputs>();

    useEffect(() => {
        if (isAddTask) {
            reset();
        }
    }, [isAddTask, reset]);

    const showAllTask = () => {
        dispatch(loadAll());
    };

    const handleOpenInputTask = () => {
        setIsAddTask(!isAddTask);
        dispatch(showAll());
    };

    const onAddTaskSubmit: SubmitHandler<AddTaskFormInputs> = (data) => {
        const newTask = {
            title: data.title,
            description: data.description,
        };

        dispatch(insertOne(newTask));

        reset();
        setIsAddTask(false);
    };

    const updateTask = (id: number, status: boolean) => {
        console.log("Update task", id, status);
        dispatch(updatedStatusTask({ id, status}));
    };

    const filterTask = (value: string) => {
        dispatch(filterTasks({ value }));
    };

    return (
        <div className="flex flex-row w-screen h-screen gap-10 px-16 py-8 bg-gray-100">
            {/* Sidebar */}
            <div id="sidebars" className="w-1/6 bg-white p-4 shadow-md rounded">
                <ul>
                    <li className="mb-4">
                        <button
                            onClick={showAllTask}
                            className="w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
                        >
                            Load All Tasks
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={handleOpenInputTask}
                            className="w-full px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600"
                        >
                            {isAddTask ? "Cancel" : "Add New Task"}
                        </button>
                    </li>
                </ul>
            </div>

            {/* Main Content */}
            <div className="w-5/6 bg-white p-8 shadow-md rounded">
                {/* Header */}
                <div className="flex flex-row justify-between mb-6">
                    <h2 className="text-xl font-bold">Task List</h2>
                    <div className="flex flex-row items-center">
                        <h3 className="mr-4 text-lg font-semibold">Filter Tasks</h3>
                        <input
                            type="text"
                            placeholder="Enter keyword"
                            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onChange={(event) => filterTask(event.target.value)}
                        />
                    </div>
                </div>

                {/* Add Task */}
                {isAddTask && (
                    <form onSubmit={handleSubmit(onAddTaskSubmit)} className="mb-6">
                        <div className="flex flex-row gap-4">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    placeholder="Title"
                                    {...register("title", { required: "Title is required" })}
                                    className={`w-full px-3 py-2 border rounded ${
                                        errors.title ? "border-red-500" : "border-gray-300"
                                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                />
                                {errors.title && (
                                    <span className="text-red-500 text-sm">{errors.title.message}</span>
                                )}
                            </div>
                            <div className="flex-1">
                                <input
                                    type="text"
                                    placeholder="Description"
                                    {...register("description", { required: "Description is required" })}
                                    className={`w-full px-3 py-2 border rounded ${
                                        errors.description ? "border-red-500" : "border-gray-300"
                                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                />
                                {errors.description && (
                                    <span className="text-red-500 text-sm">{errors.description.message}</span>
                                )}
                            </div>
                            <button
                                type="submit"
                                className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
                            >
                                Add
                            </button>
                        </div>
                    </form>
                )}

                {/* Task Table */}
                <div>
                    <table className="w-full table-auto border-collapse">
                        <thead>
                            <tr className="text-left bg-blue-500">
                                <th className="px-4 py-2 border">ID</th>
                                <th className="px-4 py-2 border">Title</th>
                                <th className="px-4 py-2 border">Description</th>
                                <th className="px-4 py-2 border">Status</th>
                                <th className="px-4 py-2 border">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentTaskList.map((task, index) => (
                                <tr key={task.id} className="hover:bg-gray-100">
                                    <td className="px-4 py-2 border text-black">{task.id}</td>
                                    <td className="px-4 py-2 border text-black">{task.title}</td>
                                    <td className="px-4 py-2 border text-black">{task.description}</td>
                                    <td className="px-4 py-2 border text-black">
                                        {task.status ? "Done" : "Pending"}
                                    </td>
                                    <td className="px-4 py-2 border">
                                        <input
                                            type="checkbox"
                                            checked={task.status}
                                            onChange={(e) => updateTask(task.id, e.target.checked)}
                                            className="cursor-pointer appearance-none h-5 w-5 border border-gray-300 rounded-md checked:bg-green-500 checked:border-transparent focus:outline-none"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Tasks;
