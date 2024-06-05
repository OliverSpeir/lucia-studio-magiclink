// db/config.ts
import { column, defineDb, defineTable } from "astro:db";

const User = defineTable({
  columns: {
    id: column.text({
      primaryKey: true,
    }),
    email: column.text(),
    email_verified: column.boolean({
      default: false
    }),
  },
});

const Session = defineTable({
  columns: {
    id: column.text({
      primaryKey: true,
    }),
    expiresAt: column.date(),
    userId: column.text({
      references: () => User.columns.id,
    }),
  },
});

const EmailVerificationToken = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    user_id: column.text({ references: () => User.columns.id }),
    email: column.text(),
    expires_at: column.date(),
  },
});

export default defineDb({
  tables: {
    User,
    Session,
    EmailVerificationToken,
  },
});
