import { Router } from 'express'
import { db } from '../db/client.js'
import { requireFamily } from '../middleware/requireFamily.js'
import { requireParent } from '../middleware/requireParent.js'

const router = Router()
router.use(requireFamily)

router.get('/config', async (req, res) => {
  const { rows } = await db.query(
    'SELECT schedule_config FROM families WHERE id = $1',
    [req.familyId]
  )
  res.json(rows[0]?.schedule_config ?? {})
})

router.put('/config', requireParent, async (req, res) => {
  const { summer, disabledHolidays, breaks } = req.body

  const config = {
    summer:           summer           ?? null,
    disabledHolidays: disabledHolidays ?? [],
    breaks:           breaks           ?? [],
  }

  await db.query(
    'UPDATE families SET schedule_config = $1 WHERE id = $2',
    [JSON.stringify(config), req.familyId]
  )
  res.json(config)
})

export default router
