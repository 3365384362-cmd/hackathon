import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'Sprint · 黑客松产品工作台',description:'从需求定义到最终路演，在一个私有工作台里完成产品冲刺。',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>) {return <html lang="zh-CN"><body>{children}</body></html>;}
