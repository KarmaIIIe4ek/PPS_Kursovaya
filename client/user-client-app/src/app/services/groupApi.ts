import type { GroupWithMembers, GroupWithTasks, GroupWithTasksAndUsers } from "../types";
import { api } from "./api";

export const groupApi = api.injectEndpoints({
    endpoints: (builder) => ({
        create: builder.mutation<
            {message: string},
            {group_number: string}
        > ({
            query: (userData) => ({
                url: '/teacher/group/create',
                method: 'POST',
                body: userData
            })
        }),
        addUserToGroup: builder.mutation<
            {message: string},
            {email: string; hash_code_login: string}
        > ({
            query: (userData) => ({
                url: '/teacher/group/addUserToGroup',
                method: 'POST',
                body: userData
            })
        }),
        removeFromGroupByEmail: builder.mutation<
            {message: string},
            {email: string; hash_code_login: string}
        > ({
            query: (userData) => ({
                url: '/teacher/group/removeFromGroupByEmail',
                method: 'POST',
                body: userData
            })
        }),
        deleteById: builder.mutation<
            {message: string},
            {id_group: number}
        > ({
            query: (userData) => ({
                url: '/teacher/group/deleteById',
                method: 'POST',
                body: userData
            })
        }),
        grantRightsToGroup: builder.mutation<
            {message: string},
            {id_task: number; hash_code_login: string }
        > ({
            query: (userData) => ({
                url: '/teacher/group/grantRightsToGroup',
                method: 'POST',
                body: userData
            })
        }),
        changeIsOpenById: builder.mutation<
            {message: string},
            {id_task: number; hash_code_login: string }
        > ({
            query: (userData) => ({
                url: '/teacher/group/changeIsOpenById',
                method: 'POST',
                body: userData
            })
        }),
        addSelfToGroup: builder.mutation<
            {message: string},
            {hash_code_login: string }
        > ({
            query: (userData) => ({
                url: '/student/group/addSelfToGroup',
                method: 'POST',
                body: userData
            })
        }),
        removeSelfFromGroup: builder.mutation<
            {message: string},
            {hash_code_login: string }
        > ({
            query: (userData) => ({
                url: '/student/group/removeSelfFromGroup',
                method: 'POST',
                body: userData
            })
        }),
        getAllMyGroups: builder.query<GroupWithTasksAndUsers[], void>({
            query: () => ({
                url: '/teacher/group/getAllMyGroups',
                method: 'GET',
            })
        }),
        getAllMyAccess: builder.query<GroupWithTasks[], void>({
            query: () => ({
                url: '/teacher/group/getAllMyAccess',
                method: 'GET',
            })
        }),
        getGroupsWhereIAmMember: builder.query<GroupWithMembers[], void>({
            query: () => ({
                url: '/student/group/getGroupsWhereIAmMember',
                method: 'GET',
            })
        })
    })
})

export const {
    useCreateMutation,
    useAddUserToGroupMutation,
    useRemoveFromGroupByEmailMutation,
    useDeleteByIdMutation,
    useGrantRightsToGroupMutation,
    useChangeIsOpenByIdMutation,
    useAddSelfToGroupMutation,
    useRemoveSelfFromGroupMutation,
    useGetAllMyGroupsQuery,
    useLazyGetAllMyGroupsQuery,
    useGetAllMyAccessQuery,
    useLazyGetAllMyAccessQuery,
    useGetGroupsWhereIAmMemberQuery,
    useLazyGetGroupsWhereIAmMemberQuery
} = groupApi;

export const {
    endpoints: { create, addUserToGroup, removeFromGroupByEmail, deleteById, grantRightsToGroup, changeIsOpenById, addSelfToGroup, removeSelfFromGroup, getAllMyGroups, getAllMyAccess, getGroupsWhereIAmMember },
  } = groupApi