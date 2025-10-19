import { createJSONStorage, persist } from 'zustand/middleware';

import { create } from 'zustand';

/**
 * 用户类型定义
 */
export interface User {
    id: string;
    email: string;
    name: string;
    avatar?: string;
}

/**
 * 认证状态接口
 */
interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    setUser: (user: User) => void;
    setLoading: (loading: boolean) => void;
}

/**
 * 认证状态管理 Store
 * 使用 Zustand 进行状态管理，支持持久化存储
 */
export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,

            /**
             * 登录方法
             * @param email 邮箱
             * @param password 密码
             * @returns Promise<boolean> 登录是否成功
             */
            login: async (email: string, password: string) => {
                set({ isLoading: true });

                try {
                    // 模拟 API 调用延迟
                    await new Promise(resolve => setTimeout(resolve, 1000));

                    // 模拟登录验证（演示用）
                    if (email === 'admin@example.com' && password === 'password') {
                        const user: User = {
                            id: '1',
                            email: email,
                            name: '演示用户',
                            avatar: '/images/avatar.jpg'
                        };

                        set({
                            user,
                            isAuthenticated: true,
                            isLoading: false
                        });

                        // 设置认证 cookie（用于服务端验证）
                        if (typeof window !== 'undefined') {
                            document.cookie = `auth-token=demo-token; path=/; max-age=86400`;
                        }

                        return true;
                    } else {
                        set({ isLoading: false });
                        return false;
                    }
                } catch (error) {
                    console.error('登录错误:', error);
                    set({ isLoading: false });
                    return false;
                }
            },

            /**
             * 登出方法
             */
            logout: () => {
                set({
                    user: null,
                    isAuthenticated: false,
                    isLoading: false
                });

                // 清除认证 cookie
                if (typeof window !== 'undefined') {
                    document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
                }
            },

            /**
             * 设置用户信息
             * @param user 用户对象
             */
            setUser: (user: User) => {
                set({ user, isAuthenticated: true });
            },

            /**
             * 设置加载状态
             * @param loading 加载状态
             */
            setLoading: (loading: boolean) => {
                set({ isLoading: loading });
            }
        }),
        {
            name: 'auth-storage', // 本地存储的 key
            storage: createJSONStorage(() => {
                // 确保在客户端环境下才使用 localStorage
                if (typeof window !== 'undefined') {
                    return localStorage;
                }
                // 服务端返回一个空的存储对象
                return {
                    getItem: () => null,
                    setItem: () => { },
                    removeItem: () => { },
                };
            }),
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated
            }), // 只持久化用户信息和认证状态
        }
    )
);