#!/bin/bash
# Simple Database Backup Script for Afaq Al-Mansoura

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
DB_NAME="afaq-almansourah-db"
BACKUP_DIR="/home/user/backups/afaq-almansourah"
DATE=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="backup-$DATE.sql"

echo -e "${BLUE}🔄 Starting database backup...${NC}"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Check if CLOUDFLARE_API_TOKEN is set
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo -e "${RED}❌ Error: CLOUDFLARE_API_TOKEN is not set${NC}"
    echo "Please set it: export CLOUDFLARE_API_TOKEN=\"your-token-here\""
    exit 1
fi

# Export database
echo -e "${BLUE}📦 Exporting database...${NC}"
npx wrangler d1 export $DB_NAME --remote --output="$BACKUP_DIR/$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backup completed successfully!${NC}"
    echo -e "${GREEN}📁 File: $BACKUP_DIR/$BACKUP_FILE${NC}"
    
    # Get file size
    SIZE=$(du -h "$BACKUP_DIR/$BACKUP_FILE" | cut -f1)
    echo -e "${GREEN}📊 Size: $SIZE${NC}"
    
    # Get statistics
    echo -e "${BLUE}📊 Getting database statistics...${NC}"
    npx wrangler d1 execute $DB_NAME --remote --json \
      --command="SELECT 
        (SELECT COUNT(*) FROM users WHERE user_type='student') as students,
        (SELECT COUNT(*) FROM teachers) as teachers,
        (SELECT COUNT(*) FROM evaluations) as evaluations" \
      > "$BACKUP_DIR/stats-$DATE.json"
    
    echo -e "${GREEN}✅ Backup completed!${NC}"
    echo ""
    echo -e "${BLUE}📋 Backup Summary:${NC}"
    cat "$BACKUP_DIR/stats-$DATE.json" | jq -r '.[] | "Students: \(.students), Teachers: \(.teachers), Evaluations: \(.evaluations)"'
    
    # Clean up old backups (keep last 7 days)
    echo ""
    echo -e "${BLUE}🧹 Cleaning up old backups (older than 7 days)...${NC}"
    find "$BACKUP_DIR" -name "backup-*.sql" -mtime +7 -delete
    find "$BACKUP_DIR" -name "stats-*.json" -mtime +7 -delete
    echo -e "${GREEN}✅ Cleanup completed${NC}"
    
else
    echo -e "${RED}❌ Backup failed!${NC}"
    exit 1
fi

# Copy to AI Drive if mounted
if [ -d "/mnt/aidrive" ]; then
    echo ""
    echo -e "${BLUE}💾 Copying to AI Drive...${NC}"
    mkdir -p /mnt/aidrive/backups/afaq-almansourah
    cp "$BACKUP_DIR/$BACKUP_FILE" /mnt/aidrive/backups/afaq-almansourah/ 2>/dev/null
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Copied to AI Drive${NC}"
    else
        echo -e "${RED}⚠️ Could not copy to AI Drive (slow or unavailable)${NC}"
    fi
fi

echo ""
echo -e "${GREEN}🎉 All done!${NC}"
