using System;
using System.Linq;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace GlovoArchitectureExamples
{
    // Моделі даних
    public class Order
    {
        public int Id { get; set; }
        public Location RestaurantLocation { get; set; }
    }

    public class OrderRequest
    {
        public int OrderId { get; set; }
    }

    public class Location
    {
        public double Latitude { get; set; }
        public double Longitude { get; set; }
    }

    public class Courier
    {
        public int Id { get; set; }
        public Location Location { get; set; }
        public int? AssignedOrderId { get; set; }
    }

    public enum CourierStatus { Online, Busy, Offline }

    public interface ICourierRepository
    {
        IQueryable<Courier> GetAvailableCouriers();
        void UpdateStatus(int courierId, CourierStatus status);
    }

    public interface IDispatchEngine
    {
        Courier AssignOrderToNearestCourier(Order order);
        bool ConfirmCourierAssignment(int courierId, int orderId);
    }

    // 1. HTTP-запит до API та бізнес-логіка
    public class DispatchEngine : IDispatchEngine
    {
        private readonly ICourierRepository _courierRepo;

        public DispatchEngine(ICourierRepository courierRepo)
        {
            _courierRepo = courierRepo;
        }

        public Courier AssignOrderToNearestCourier(Order order)
        {
            var availableCouriers = _courierRepo.GetAvailableCouriers();
            var nearestCourier = availableCouriers
                .OrderBy(c => CalculateDistance(c.Location, order.RestaurantLocation))
                .FirstOrDefault();
                
            if (nearestCourier != null)
            {
                nearestCourier.AssignedOrderId = order.Id;
                _courierRepo.UpdateStatus(nearestCourier.Id, CourierStatus.Busy);
            }
            return nearestCourier;
        }

        public bool ConfirmCourierAssignment(int courierId, int orderId)
        {
            // Логіка перевірки, чи не зайняте замовлення
            return true;
        }

        private double CalculateDistance(Location loc1, Location loc2)
        {
            return Math.Sqrt(Math.Pow(loc1.Latitude - loc2.Latitude, 2) + 
                             Math.Pow(loc1.Longitude - loc2.Longitude, 2));
        }
    }

    [ApiController]
    [Route("api/v1/couriers")]
    public class CourierController : ControllerBase
    {
        private readonly IDispatchEngine _dispatchEngine;

        public CourierController(IDispatchEngine dispatchEngine)
        {
            _dispatchEngine = dispatchEngine;
        }

        [HttpPost("{courierId}/accept-order")]
        public IActionResult AcceptOrder(int courierId, [FromBody] OrderRequest request)
        {
            var success = _dispatchEngine.ConfirmCourierAssignment(courierId, request.OrderId);
            if (!success) return Conflict(new { Error = "Order already assigned" });
            return Ok(new { Message = "Accepted", OrderId = request.OrderId });
        }
    }

    //2. Робота з JSON (Передача координат)
    /* Приклад вхідного JSON-документа:
    {
      "courierId": 1054,
      "latitude": 52.2296756,
      "longitude": 21.0122287,
      "timestamp": "2026-04-19T17:08:33Z"
    }
    */
    public class LocationUpdate
    {
        public int CourierId { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public DateTime Timestamp { get; set; }
    }

    // 3. Робота з файлом (Запис логів помилок)
    public class DispatchLogger
    {
        private readonly string _logPath = "Pract2/dispatch_errors.log";

        public async Task LogErrorAsync(string errorMessage)
        {
            var logEntry = $"{DateTime.UtcNow:O} [ERROR] {errorMessage}\n";
            await File.AppendAllTextAsync(_logPath, logEntry);
        }
    }
}