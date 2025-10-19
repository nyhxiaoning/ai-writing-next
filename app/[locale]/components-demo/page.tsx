"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export default function ComponentsDemo() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">shadcn/ui 组件演示</h1>
        <p className="text-muted-foreground">
          这里展示了项目中集成的 shadcn/ui 组件库的基础组件
        </p>
      </div>

      {/* Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>按钮组件</CardTitle>
          <CardDescription>不同变体和尺寸的按钮</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button>默认按钮</Button>
            <Button variant="secondary">次要按钮</Button>
            <Button variant="outline">轮廓按钮</Button>
            <Button variant="ghost">幽灵按钮</Button>
            <Button variant="link">链接按钮</Button>
            <Button variant="destructive">危险按钮</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm">小按钮</Button>
            <Button size="default">默认按钮</Button>
            <Button size="lg">大按钮</Button>
            <Button size="icon">
              <CheckCircle2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Form Components */}
      <Card>
        <CardHeader>
          <CardTitle>表单组件</CardTitle>
          <CardDescription>输入框和标签组件</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="email">邮箱</Label>
            <Input type="email" id="email" placeholder="请输入邮箱" />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="password">密码</Label>
            <Input type="password" id="password" placeholder="请输入密码" />
          </div>
        </CardContent>
      </Card>

      {/* Badges */}
      <Card>
        <CardHeader>
          <CardTitle>徽章组件</CardTitle>
          <CardDescription>不同样式的徽章</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge>默认</Badge>
            <Badge variant="secondary">次要</Badge>
            <Badge variant="outline">轮廓</Badge>
            <Badge variant="destructive">危险</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>警告组件</CardTitle>
          <CardDescription>不同类型的警告信息</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>提示</AlertTitle>
            <AlertDescription>
              这是一个默认的警告信息，用于显示一般性的提示内容。
            </AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>错误</AlertTitle>
            <AlertDescription>
              这是一个错误警告信息，用于显示错误或危险的内容。
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Cards */}
      <Card>
        <CardHeader>
          <CardTitle>卡片组件</CardTitle>
          <CardDescription>展示卡片组件的不同部分</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>示例卡片 1</CardTitle>
                <CardDescription>这是一个示例卡片的描述</CardDescription>
              </CardHeader>
              <CardContent>
                <p>这里是卡片的主要内容区域。</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>示例卡片 2</CardTitle>
                <CardDescription>另一个示例卡片</CardDescription>
              </CardHeader>
              <CardContent>
                <p>卡片可以包含各种类型的内容。</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}