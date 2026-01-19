# CEO Ralph - One-Click Setup for Claude Code
# Run: .\setup.ps1 -OpenAIKey "sk-your-key-here"

param(
    [Parameter(Mandatory=$false)]
    [string]$OpenAIKey
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 CEO Ralph Setup" -ForegroundColor Cyan
Write-Host "==================" -ForegroundColor Cyan

# Get the script's directory (where ceo-ralph is located)
$CEORalphPath = $PSScriptRoot
$MCPServerPath = Join-Path $CEORalphPath "plugins\ceo-ralph\mcp-codex-worker"
$PluginPath = Join-Path $CEORalphPath "plugins\ceo-ralph"

if (-not (Test-Path $MCPServerPath)) {
    throw "MCP server path not found: $MCPServerPath"
}

# Ensure Node and npm are available
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    throw "Node.js is not installed or not on PATH. Install Node.js 18+ first."
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    throw "npm is not installed or not on PATH. Install Node.js 18+ first."
}

# Step 1: Install and build MCP server
Write-Host "`n📦 Installing MCP server dependencies..." -ForegroundColor Yellow
Push-Location $MCPServerPath
npm install
if ($LASTEXITCODE -ne 0) { throw "npm install failed" }

Write-Host "🔨 Building MCP server..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) { throw "npm build failed" }
Pop-Location

# Verify build output exists
$DistPath = Join-Path $MCPServerPath "dist\index.js"
if (-not (Test-Path $DistPath)) {
    throw "Build succeeded but dist/index.js not found at: $DistPath"
}

# Step 2: Set OpenAI API Key if provided
if ($OpenAIKey) {
    Write-Host "`n🔑 Setting OPENAI_API_KEY environment variable..." -ForegroundColor Yellow
    [Environment]::SetEnvironmentVariable("OPENAI_API_KEY", $OpenAIKey, "User")
    $env:OPENAI_API_KEY = $OpenAIKey
    Write-Host "   API key saved to user environment variables" -ForegroundColor Green
} elseif (-not $env:OPENAI_API_KEY) {
    Write-Host "`n⚠️  No OPENAI_API_KEY found. Set it later with:" -ForegroundColor Yellow
    Write-Host '   [Environment]::SetEnvironmentVariable("OPENAI_API_KEY", "sk-your-key", "User")' -ForegroundColor Gray
}

# Step 3: Configure Claude Code MCP
Write-Host "`n⚙️  Configuring Claude Code MCP server..." -ForegroundColor Yellow

$ClaudeConfigDir = Join-Path $env:USERPROFILE ".claude"
$MCPConfigPath = Join-Path $ClaudeConfigDir "mcp.json"

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
        Write-Host "   Found existing mcp.json, updating..." -ForegroundColor Gray
    } catch {
        $backupPath = "$MCPConfigPath.bak"
        Copy-Item $MCPConfigPath $backupPath -Force
        Write-Host "   Existing mcp.json is not valid JSON. Backed up to: $backupPath" -ForegroundColor Yellow
        $config = @{ mcpServers = @{} }
    }
} else {
    $config = @{ mcpServers = @{} }
    Write-Host "   Creating new mcp.json..." -ForegroundColor Gray
}

if (-not $config.ContainsKey("mcpServers")) {
    $config.mcpServers = @{}
}

# Add/update codex-worker server
$config.mcpServers["codex-worker"] = @{
    type = "stdio"
    command = "node"
    args = @($DistPath)
    env = @{
        OPENAI_API_KEY = '${OPENAI_API_KEY}'
    }
}

# Write config
$config | ConvertTo-Json -Depth 10 | Set-Content $MCPConfigPath -Encoding UTF8

Write-Host "   MCP config written to: $MCPConfigPath" -ForegroundColor Green

# Done!
Write-Host "`n✅ Setup complete!" -ForegroundColor Green
Write-Host "`n📋 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Restart Claude Code" -ForegroundColor White
$PluginPathForCommand = $PluginPath -replace '\\', '/'
Write-Host "   2. In Claude Code, run: /plugin install $PluginPathForCommand" -ForegroundColor White
Write-Host "   3. Start using CEO Ralph with: /ceo-ralph:start" -ForegroundColor White

if (-not $OpenAIKey -and -not $env:OPENAI_API_KEY) {
    Write-Host "`n⚠️  Don't forget to set your OPENAI_API_KEY!" -ForegroundColor Yellow
}
