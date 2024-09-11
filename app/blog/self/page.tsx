/*
 * @Author: ningyongheng ningyongheng@jeejio.com
 * @Date: 2024-09-11 14:53:32
 * @LastEditors: ningyongheng ningyongheng@jeejio.com
 * @LastEditTime: 2024-09-11 15:26:43
 * @FilePath: /tailwind-landing-page-template/app/blog/self/md.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// TODO:解决静态导出的路由匹配问题
// generateStaticParams 用来指定哪些动态路由页面需要被预生成
export async function generateStaticParams() {
  let currentPage = [{id:'md'}];
  // 假设你有一些预定义的 id


  const posts = currentPage;

  // 返回的数组将作为预生成的静态页面路径
  return posts.map((post) => ({
    id: post.id,
  }));
}
const PageSelf = () => {
  return <div>PageSelf</div>;
};

export default PageSelf;
