import { changeBlog, delBlog } from './action'

import { useRouter } from 'next/router';

export default function Page({ params }: { params: { slug: string } }) {
    const router = useRouter();
    const handleClick = () => {
        router.push('/routestudy');
    };
    // TODO:动态修改方法1:1.路由写法，获取参数，填入。
    // 根据创建的【🆔】如果是id，这里对应query取id
    const { id } = router.query;
    // 通过传入的slug，然后查询当前的博客界面：查询当前的传入的slug页面
    // TODO:动态修改方法2:1.通过page函数入参传入，
    return <div>
        <div>
            <button onClick={handleClick}>返回路由主页页面</button>
            My Post: url传入的当前的路由页面{id}
            <button onClick={() => delBlog(id)}>删除id字段{id}</button>
            <button onClick={() => changeBlog(id)}>修改id字段{id}</button>
        </div>
    </div>
}