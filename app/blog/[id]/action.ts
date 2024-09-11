// "use server";

export async function delBlog(id: any) {
  // 调用数据库，删除 id 对应的 blog
  alert(`删除成功${id}`);
  return true;
}

export async function changeBlog(id: any) {
  // 调用数据库，删除 id 对应的 blog
  alert(`修改成功${id}`);
  return true;
}
