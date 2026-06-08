# Free Tailwind landing page template
# 增加两个功能
## 灵感收集
收集各种内容记录

## 知识库
汇总这篇小说或短文，引用的所有的资源整理，就和图书的引用一样；


## vercel不支持sqlite，但是支持在线postgres

- Neon 注册和设置指南，支持Vercel
请按以下步骤操作：
1. 注册 Neon
* 打开 https://neon.tech
* 点击 Sign Up，用 GitHub 或邮箱注册
* 免费套餐包含 500MB 数据、无限分支
2. 创建项目
* 登录后点击 Create Project
* 项目名：wordflow（或任意）
* Region：选 Tokyo (ap-northeast-1) 或 Singapore (ap-southeast-1)（离国内近）
* 点击 Create Project

npm run dev
登录 15600705234@163.com / 1234qwer，确认之前的作品和模板都在，然后创建一个新作品看看是否正常工作。
7. 部署到 Vercel
* 在 Vercel 项目 Dashboard → Settings → Environment Variables
* 添加 DATABASE_URL，值为 Neon 连接串
* 重新部署




![Simple TailwindCSS template preview](https://user-images.githubusercontent.com/2683512/231426766-72ae7bcd-618b-4a3e-87cd-b46a464bde61.png)

**Simple Light** is a free landing page template built on top of **TailwindCSS** and fully coded in **React** / **Next.js**. Simple light is designed to provide all the basic components a developer need to create a landing page for SaaS products, online services, and more. 
Use it for whatever you want, and be sure to reach us out on Twitter if you build anything cool/useful with it.
Created and maintained with ❤️ by [Cruip.com](https://cruip.com/).

*Version 1.3.3 built with Tailwind CSS and React + Vite is available [here](https://github.com/cruip/tailwind-landing-page-template/releases/tag/1.3.3).*

## Live demo

Check the live demo here 👉️ [https://simple.cruip.com/](https://simple.cruip.com/)

## Simple Pro

[![Simple Pro](https://user-images.githubusercontent.com/2683512/151178282-fd81b300-349a-42c3-a30a-f70f6e711e74.png)](https://cruip.com/)

## Design files

If you need the design files, you can download them from Figma's Community 👉 https://bit.ly/3HOZMpf

## Usage

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

### Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

### Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

### Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.


### Support notes
This template has been developed with the App Router (`app`) and React Server Components. If you’re unfamiliar with these beta features, you can find more information about them on the Next.js beta documentation page. So, please note that any request dealing with React (e.g. extra features, customisations, et cetera) is to be considered out of the support scope.

For more information about what support covers, please see our (FAQs)[https://cruip.com/faq/].

## Credits

- [Nucleo](https://nucleoapp.com/)

## Terms and License

- Released under the [GPL](https://www.gnu.org/licenses/gpl-3.0.html).
- Copyright 2020 [Cruip](https://cruip.com/).
- Use it for personal and commercial projects, but please don’t republish, redistribute, or resell the template.
- Attribution is not required, although it is really appreciated.

## About Us

We're an Italian developer/designer duo creating high-quality design/code resources for developers, makers, and startups.

## Stay in the loop

If you would like to know when we release new resources, you can follow us on [Twitter](https://twitter.com/Cruip_com), or you can subscribe to our monthly [newsletter](https://cruip.com/#subscribe).