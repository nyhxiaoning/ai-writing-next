/**
 * SQLite → PostgreSQL 数据迁移脚本
 *
 * 用法（分两步）：
 *   第一步（切换 env 前）： npx tsx scripts/migrate-to-neon.ts --dump
 *     从 SQLite 导出所有数据到 .migration-data/ 目录
 *
 *   第二步（切换 env + db push 后）： npx tsx scripts/migrate-to-neon.ts --load
 *     从 .migration-data/ 目录导入数据到 Neon PostgreSQL
 *
 *   --dump-and-load: 如果 SQLite 和 PostgreSQL 均可访问，一步完成
 */

import { execSync } from 'child_process'
import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

// ─── 配置 ─────────────────────────────────────────────

const DATA_DIR = path.join(__dirname, '..', '.migration-data')
const SQLITE_DB = path.join(__dirname, '..', 'prisma', 'dev.db')

// 依赖顺序（父表在前，子表在后）
const TABLES = [
  { name: 'User',            fks: [] as string[] },
  { name: 'Post',            fks: ['userId'] },
  { name: 'Template',        fks: ['userId'] },
  { name: 'Book',            fks: ['userId'] },
  { name: 'BookSyncConfig',  fks: ['userId', 'bookId'] },
  { name: 'Faction',         fks: ['bookId'] },
  { name: 'Character',       fks: ['bookId', 'factionId'] },
  { name: 'Equipment',       fks: ['bookId', 'ownerId'] },
  { name: 'Chapter',         fks: ['bookId'] },
  { name: 'ChapterVersion',  fks: ['chapterId'] },
  { name: 'TimelineEvent',   fks: ['bookId'] },
  { name: 'Map',             fks: ['bookId'] },
  { name: 'MapMarker',       fks: ['mapId'] },
  { name: 'Note',            fks: ['bookId', 'userId'] },
  { name: 'FocusSession',    fks: ['userId'] },
  { name: 'OutlineNode',     fks: ['bookId', 'parentId'] },
  { name: 'BatchReplaceRecord', fks: ['bookId', 'userId'] },
  { name: 'CommunityPost',   fks: ['userId'] },
  { name: 'Comment',         fks: ['userId', 'postId', 'parentId'] },
  { name: 'AiConfig',        fks: ['userId'] },
  { name: 'AiChatSession',   fks: ['userId', 'bookId'] },
  { name: 'AiChatMessage',   fks: ['sessionId'] },
]

// DateTime 字段（sqlite3 导出为字符串，需转为 Date）
const DATE_FIELDS = new Set([
  'createdAt', 'updatedAt', 'emailVerifiedAt', 'resetTokenExpiry',
  'lastSyncedAt', 'emailVerifiedAt',
])

// Boolean 字段（sqlite3 导出为 0/1，需转为 boolean）
const BOOL_FIELDS = new Set([
  'emailVerified', 'pinned', 'collapsed', 'completed', 'isOfficial',
  'caseSensitive', 'useRegex',
])

// ─── 辅助函数 ──────────────────────────────────────────

function parseRow(row: Record<string, any>): Record<string, any> {
  const parsed: Record<string, any> = {}
  for (const [key, value] of Object.entries(row)) {
    if (value === null) {
      parsed[key] = null
    } else if (DATE_FIELDS.has(key)) {
      parsed[key] = new Date(value)
    } else if (BOOL_FIELDS.has(key)) {
      parsed[key] = value === 1 || value === true || value === '1'
    } else {
      parsed[key] = value
    }
  }
  return parsed
}

// ─── Dump: SQLite → JSON ──────────────────────────────

function dumpFromSqlite() {
  if (!fs.existsSync(SQLITE_DB)) {
    console.error('❌ SQLite 数据库不存在:', SQLITE_DB)
    process.exit(1)
  }

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }

  for (const { name } of TABLES) {
    const result = execSync(
      `sqlite3 "${SQLITE_DB}" -json "SELECT * FROM \\"${name}\\";"`,
      { encoding: 'utf-8', maxBuffer: 50 * 1024 * 1024 },
    )

    // sqlite3 返回空数组 "[]" 或实际数据
    const output = result || '[]'
    fs.writeFileSync(path.join(DATA_DIR, `${name}.json`), output, 'utf-8')

    const count = JSON.parse(output).length
    console.log(`  ${name}: ${count} 行`)
  }

  console.log(`\n✅ 数据已导出到 ${DATA_DIR}`)
}

// ─── Load: JSON → PostgreSQL ──────────────────────────

async function loadToPostgres() {
  if (!fs.existsSync(DATA_DIR)) {
    console.error(`❌ 未找到数据目录 ${DATA_DIR}，请先运行 --dump`)
    process.exit(1)
  }

  const prisma = new PrismaClient()

  try {
    // 测试连接
    await prisma.$connect()
    console.log('✅ 已连接到 PostgreSQL')

    // 逐表导入
    for (const { name } of TABLES) {
      const filePath = path.join(DATA_DIR, `${name}.json`)
      if (!fs.existsSync(filePath)) {
        console.log(`  ${name}: 跳过（文件不存在）`)
        continue
      }

      const rawData = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
      if (rawData.length === 0) {
        console.log(`  ${name}: 0 行，跳过`)
        continue
      }

      const rows = rawData.map(parseRow)

      // 批量创建
      for (const row of rows) {
        const modelName = name.charAt(0).toLowerCase() + name.slice(1)
        try {
          await (prisma as any)[modelName].create({ data: row })
        } catch (err) {
          console.error(`  ${name}: 插入失败 id=${row.id}`, err instanceof Error ? err.message : err)
        }
      }

      console.log(`  ${name}: ${rows.length} 行 ✅`)
    }

    console.log('\n🎉 数据迁移完成！')
  } catch (error) {
    console.error('❌ PostgreSQL 连接失败:', error instanceof Error ? error.message : error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// ─── 入口 ──────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2)
  const mode = args[0]

  if (mode === '--dump') {
    console.log('📤 从 SQLite 导出数据...')
    dumpFromSqlite()
  } else if (mode === '--load') {
    console.log('📥 导入数据到 PostgreSQL...')
    await loadToPostgres()
  } else if (mode === '--dump-and-load') {
    console.log('📤 从 SQLite 导出数据...')
    dumpFromSqlite()
    console.log('\n📥 导入数据到 PostgreSQL...')
    await loadToPostgres()
  } else {
    console.log(`
用法:
  npx tsx scripts/migrate-to-neon.ts --dump         # 从 SQLite 导出
  npx tsx scripts/migrate-to-neon.ts --load          # 导入到 PostgreSQL
  npx tsx scripts/migrate-to-neon.ts --dump-and-load  # 一步完成（SQLite+PG 同时可用时）
`)
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('迁移失败:', err)
  process.exit(1)
})
