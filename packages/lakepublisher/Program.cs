using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Parquet;
using Parquet.Data;
using Parquet.Schema;

namespace LakePublisher
{
    public class Expense
    {
        public string _id { get; set; }
        public string title { get; set; }
        public string comment { get; set; }
        public DateTime startDate { get; set; }
        public DateTime? endDate { get; set; }
        public string status { get; set; }
        public string attachment { get; set; }
        public bool exported { get; set; }
    }

    public partial class Program
    {


        private static readonly HttpClient httpClient = new HttpClient();
        
        static async Task Main(string[] args)
        {
            Console.WriteLine("Lake Publisher starting...");
            Console.WriteLine($"Arguments count: {args.Length}");
            Console.WriteLine($"Current directory: {Directory.GetCurrentDirectory()}");
            
            try
            {
                var apiBaseUrl = Environment.GetEnvironmentVariable("API_BASE_URL") ?? "http://localhost:3000";
                var targetStatus = Environment.GetEnvironmentVariable("TARGET_STATUS") ?? "Approved";
                var basePath = Environment.GetEnvironmentVariable("BASE_PATH") ?? "./data";
                var apiToken = Environment.GetEnvironmentVariable("API_TOKEN") ?? "lakepublisher-token-2024";
                
                // Configure HTTP client with authentication
                httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {apiToken}");
                
                var yesterday = DateTime.Today.AddDays(-1);
                var outputPath = Path.Combine(basePath, yesterday.ToString("yyyy"), yesterday.ToString("MM"), yesterday.ToString("dd"), "expenses.parquet");
                
                Console.WriteLine($"Configuration loaded:");
                Console.WriteLine($"  API Base URL: {apiBaseUrl}");
                Console.WriteLine($"  Target Status: {targetStatus}");
                Console.WriteLine($"  Base Path: {basePath}");
                Console.WriteLine($"  API Token: {apiToken?.Substring(0, Math.Min(10, apiToken.Length))}...");
                Console.WriteLine($"  Target Date: {yesterday:yyyy-MM-dd}");
                Console.WriteLine($"  Output Path: {outputPath}");
                
                var expenses = await FetchExpenses(apiBaseUrl);
                var filteredExpenses = FilterExpensesByDate(expenses, targetStatus);
                
                Console.WriteLine("Matching expense IDs:");
                foreach (var expense in filteredExpenses)
                {
                    Console.WriteLine($"  - {expense._id}");
                }
                
                Console.WriteLine($"Found {filteredExpenses.Count} matching expenses");
                
                if (filteredExpenses.Count > 0)
                {
                    await SaveToParquet(filteredExpenses, outputPath);
                    Console.WriteLine($"Data exported to {outputPath}");
                    
                    await UpdateExportedStatus(apiBaseUrl, filteredExpenses);
                    Console.WriteLine("Updated exported status for all expenses");
                }
                else
                {
                    Console.WriteLine("No matching expenses found");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                Environment.Exit(1);
            }
            finally
            {
                Console.WriteLine("Lake Publisher finished.");
            }
        }
        
        static async Task<List<Expense>> FetchExpenses(string apiBaseUrl)
        {
            try
            {
                Console.WriteLine($"Fetching expenses from: {apiBaseUrl}/api/expenses");
                var response = await httpClient.GetStringAsync($"{apiBaseUrl}/api/expenses");
                Console.WriteLine($"API response received, length: {response.Length} characters");
                var expenses = JsonConvert.DeserializeObject<List<Expense>>(response);
                Console.WriteLine($"Parsed {expenses?.Count ?? 0} expenses from API");
                return expenses ?? new List<Expense>();
            }
            catch (HttpRequestException ex)
            {
                Console.WriteLine($"HTTP error fetching expenses: {ex.Message}");
                throw;
            }
            catch (JsonException ex)
            {
                Console.WriteLine($"JSON parsing error: {ex.Message}");
                throw;
            }
        }
        
        public static List<Expense> FilterExpensesByDate(List<Expense> expenses, string targetStatus)
        {
            var yesterday = DateTime.Today.AddDays(-1);
            var filtered = new List<Expense>();
            
            foreach (var expense in expenses)
            {
                if (expense.status == targetStatus && 
                    expense.endDate.HasValue && 
                    expense.endDate.Value.Date == yesterday &&
                    !expense.exported)
                {
                    filtered.Add(expense);
                }
            }
            
            return filtered;
        }
        
        static async Task SaveToParquet(List<Expense> expenses, string outputPath)
        {
            // Create directory structure if it doesn't exist
            var directory = Path.GetDirectoryName(outputPath);
            if (!Directory.Exists(directory))
            {
                Directory.CreateDirectory(directory);
                Console.WriteLine($"Created directory: {directory}");
            }
            
            var schema = new ParquetSchema(
                new DataField<string>("id"),
                new DataField<string>("title"),
                new DataField<string>("comment"),
                new DataField<DateTime>("startDate"),
                new DataField<DateTime?>("endDate"),
                new DataField<string>("status"),
                new DataField<string>("attachment"),
                new DataField<bool>("exported")
            );
            
            var ids = expenses.Select(e => e._id).ToArray();
            var titles = expenses.Select(e => e.title).ToArray();
            var comments = expenses.Select(e => e.comment).ToArray();
            var startDates = expenses.Select(e => e.startDate).ToArray();
            var endDates = expenses.Select(e => e.endDate).ToArray();
            var statuses = expenses.Select(e => e.status).ToArray();
            var attachments = expenses.Select(e => e.attachment).ToArray();
            var exportedFlags = expenses.Select(e => e.exported).ToArray();
            
            using var stream = File.Create(outputPath);
            using var writer = await ParquetWriter.CreateAsync(schema, stream);
            using var rowGroup = writer.CreateRowGroup();
            
            await rowGroup.WriteColumnAsync(new DataColumn(schema.DataFields[0], ids));
            await rowGroup.WriteColumnAsync(new DataColumn(schema.DataFields[1], titles));
            await rowGroup.WriteColumnAsync(new DataColumn(schema.DataFields[2], comments));
            await rowGroup.WriteColumnAsync(new DataColumn(schema.DataFields[3], startDates));
            await rowGroup.WriteColumnAsync(new DataColumn(schema.DataFields[4], endDates));
            await rowGroup.WriteColumnAsync(new DataColumn(schema.DataFields[5], statuses));
            await rowGroup.WriteColumnAsync(new DataColumn(schema.DataFields[6], attachments));
            await rowGroup.WriteColumnAsync(new DataColumn(schema.DataFields[7], exportedFlags));
        }
        
        static async Task UpdateExportedStatus(string apiBaseUrl, List<Expense> expenses)
        {
            foreach (var expense in expenses)
            {
                var updateData = new { exported = true };
                var json = JsonConvert.SerializeObject(updateData);
                var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
                
                var response = await httpClient.PutAsync($"{apiBaseUrl}/api/expenses/{expense._id}", content);
                if (response.IsSuccessStatusCode)
                {
                    Console.WriteLine($"  Updated exported status for: {expense._id}");
                }
                else
                {
                    Console.WriteLine($"  Failed to update exported status for: {expense._id}");
                }
            }
        }
    }
}
