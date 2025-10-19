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
    login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
    logout: () => Promise<void>;
    register: (name: string, email: string, password: string, confirmPassword: string, locale?: string) => Promise<{ success: boolean; error?: string }>;
    requestPasswordReset: (email: string, locale?: string) => Promise<{ success: boolean; error?: string }>;
    confirmPasswordReset: (token: string, password: string, confirmPassword: string) => Promise<{ success: boolean; error?: string }>;
    checkAuth: () => Promise<void>;
    setUser: (user: User | null) => void;
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
             * @param rememberMe 记住我
             * @returns Promise<boolean> 登录是否成功
             */
            login: async (email: string, password: string, rememberMe: boolean = false) => {
                set({ isLoading: true });

                try {
                    const response = await fetch('/api/auth/signin', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ email, password, rememberMe }),
                    });

                    const data = await response.json();

                    if (response.ok) {
                        const user: User = {
                            id: data.user.id.toString(),
                            email: data.user.email,
                            name: data.user.name,
                            avatar: data.user.avatar || '/images/avatar.jpg'
                        };

                        set({
                            user,
                            isAuthenticated: true,
                            isLoading: false
                        });

                        return true;
                    } else {
                        set({ isLoading: false });
                        console.error('登录失败:', data.error);
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
            logout: async () => {
                try {
                    await fetch('/api/auth/signout', {
                        method: 'POST',
                    });
                } catch (error) {
                    console.error('登出API调用失败:', error);
                }

                set({
                    user: null,
                    isAuthenticated: false,
                    isLoading: false
                });
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
            },

            /**
             * 注册方法
             * @param name 姓名
             * @param email 邮箱
             * @param password 密码
             * @param confirmPassword 确认密码
             * @param locale 语言
             * @returns Promise<{success: boolean, error?: string}>
             */
            register: async (name: string, email: string, password: string, confirmPassword: string, locale: string = 'zh') => {
                set({ isLoading: true });

                try {
                    const response = await fetch('/api/auth/signup', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ name, email, password, confirmPassword, locale }),
                    });

                    const data = await response.json();

                    if (response.ok) {
                        const user: User = {
                            id: data.user.id.toString(),
                            email: data.user.email,
                            name: data.user.name,
                            avatar: data.user.avatar || '/images/avatar.jpg'
                        };

                        set({
                            user,
                            isAuthenticated: true,
                            isLoading: false
                        });

                        return { success: true };
                    } else {
                        set({ isLoading: false });
                        return { success: false, error: data.error };
                    }
                } catch (error) {
                    console.error('注册错误:', error);
                    set({ isLoading: false });
                    return { success: false, error: '网络错误，请稍后重试' };
                }
            },

            /**
             * 请求重置密码
             * @param email 邮箱
             * @param locale 语言
             * @returns Promise<{success: boolean, error?: string}>
             */
            requestPasswordReset: async (email: string, locale: string = 'zh') => {
                set({ isLoading: true });

                try {
                    const response = await fetch('/api/auth/reset-password', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ email, locale }),
                    });

                    const data = await response.json();
                    set({ isLoading: false });

                    if (response.ok) {
                        return { success: true };
                    } else {
                        return { success: false, error: data.error };
                    }
                } catch (error) {
                    console.error('请求重置密码错误:', error);
                    set({ isLoading: false });
                    return { success: false, error: '网络错误，请稍后重试' };
                }
            },

            /**
             * 确认重置密码
             * @param token 重置令牌
             * @param password 新密码
             * @param confirmPassword 确认密码
             * @returns Promise<{success: boolean, error?: string}>
             */
            confirmPasswordReset: async (token: string, password: string, confirmPassword: string) => {
                set({ isLoading: true });

                try {
                    const response = await fetch('/api/auth/reset-password/confirm', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ token, password, confirmPassword }),
                    });

                    const data = await response.json();
                    set({ isLoading: false });

                    if (response.ok) {
                        return { success: true };
                    } else {
                        return { success: false, error: data.error };
                    }
                } catch (error) {
                    console.error('确认重置密码错误:', error);
                    set({ isLoading: false });
                    return { success: false, error: '网络错误，请稍后重试' };
                }
            },

            /**
             * 检查认证状态
             */
            checkAuth: async () => {
                try {
                    const response = await fetch('/api/auth/me', {
                        method: 'GET',
                        credentials: 'include',
                    });

                    if (response.ok) {
                        const data = await response.json();
                        const user: User = {
                            id: data.user.id.toString(),
                            email: data.user.email,
                            name: data.user.name,
                            avatar: data.user.avatar || '/images/avatar.jpg'
                        };

                        set({
                            user,
                            isAuthenticated: true,
                            isLoading: false
                        });
                    } else {
                        set({
                            user: null,
                            isAuthenticated: false,
                            isLoading: false
                        });
                    }
                } catch (error) {
                    console.error('检查认证状态错误:', error);
                    set({
                        user: null,
                        isAuthenticated: false,
                        isLoading: false
                    });
                }
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