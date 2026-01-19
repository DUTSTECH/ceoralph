# CEO Ralph - One-Click Setup for Claude Code (Codex CLI MCP)
# Run: .\setup.ps1

$ErrorActionPreference = "Stop"

Write-Host "🚀 CEO Ralph Setup" -ForegroundColor Cyan
Write-Host "==================" -ForegroundColor Cyan

# Step 1: Ensure Codex CLI is available
Write-Host "`n🔎 Checking Codex CLI..." -ForegroundColor Yellow
if (-not (Get-Command codex -ErrorAction SilentlyContinue)) {
    throw "Codex CLI is not installed or not on PATH. Install with: npm install -g @openai/codex"
}

# Step 2: Check auth status
Write-Host "`n🔐 Checking Codex auth..." -ForegroundColor Yellow
try {
    $authStatus = codex login status 2>&1 | Select-Object -First 1
    Write-Host "   $authStatus" -ForegroundColor Gray
} catch {
    Write-Host "   Codex not authenticated. Run: codex login" -ForegroundColor Yellow
}

# Step 3: Configure Claude Code MCP
Write-Host "`n⚙️  Configuring Claude Code MCP server..." -ForegroundColor Yellow

$ClaudeConfigDir = Join-Path $env:USERPROFILE ".claude"
$MCPConfigPath = Join-Path $ClaudeConfigDir "settings.json"

# Create .claude directory if it doesn't exist
if (-not (Test-Path $ClaudeConfigDir)) {
    New-Item -ItemType Directory -Path $ClaudeConfigDir -Force | Out-Null
}

# Build the MCP server path (use forward slashes for JSON)
$DistPath = $DistPath -replace '\\', '/'

# Read existing config or create new one
if (Test-Path $MCPConfigPath) {
    try {
        $config = Get-Content $MCPConfigPath -Raw | ConvertFrom-Json -AsHashtable
        Write-Host "   Found existing settings.json, updating..." -ForegroundColor Gray
    } catch {
        $backupPath = "$MCPConfigPath.bak"
        Copy-Item $MCPConfigPath $backupPath -Force
        Write-Host "   Existing settings.json is not valid JSON. Backed up to: $backupPath" -ForegroundColor Yellow
        $config = @{ mcpServers = @{} }
    }
} else {
    $config = @{ mcpServers = @{} }
    Write-Host "   Creating new settings.json..." -ForegroundColor Gray
}

if (-not $config.ContainsKey("mcpServers")) {
    $config.mcpServers = @{}
}

# Add/update codex server
$config.mcpServers["codex"] = @{
    type = "stdio"
    command = "codex"
    args = @("-m", "gpt-5.2-codex", "mcp-server")
}

# Write config
$config | ConvertTo-Json -Depth 10 | Set-Content $MCPConfigPath -Encoding UTF8

Write-Host "   MCP config written to: $MCPConfigPath" -ForegroundColor Green

# Done!
Write-Host "`n✅ Setup complete!" -ForegroundColor Green
Write-Host "`n📋 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Run 'codex login' if not authenticated" -ForegroundColor White
Write-Host "   2. Restart Claude Code" -ForegroundColor White
Write-Host "   3. Start using CEO Ralph with: /ceo-ralph:start" -ForegroundColor White
