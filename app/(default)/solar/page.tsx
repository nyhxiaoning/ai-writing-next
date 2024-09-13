import Link from "next/link";

export default function SummaryPage() {
  return (
    <div style={{ textAlign: "center" }}>
      <img
        src="/path/to/your/image.jpg"
        alt="Summary Image"
        width="500"
        height="300"
      />
      <h1 style={{ marginBottom: "20px" }}>页面汇总</h1>
      <ul style={{ display: "inline-block", textAlign: "left" }}>
        <li>
          <Link href="/page1">页面 1</Link>
        </li>
        <li>
          <Link href="/page2">页面 2</Link>
        </li>
        {/* 以此类推添加其他页面的链接 */}
        <li>
          <Link href="/page10">页面 10</Link>
        </li>
      </ul>
    </div>
  );
}
