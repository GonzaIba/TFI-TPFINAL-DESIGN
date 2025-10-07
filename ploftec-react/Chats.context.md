Actualice mi api por completo. Primero te paso mi api gateway y luego la de foros:

        [HttpGet]
        [Route("ObtenerSolicitudesDeAyuda")]
        [AllowAnonymous]
        public async Task<IActionResult> GetRequestsHelp(
            [FromQuery] int limit = 8,
            [FromQuery] string? after = null,
            [FromQuery] DateTime? anchorUtc = null,
            [FromQuery] string? userId = null,
            [FromQuery] string? search = null)
        {
            string URL = ApiForumBaseURL + $"SolicitudAyuda/ObtenerSolicitudesDeAyuda";
            var queryParams = new
            {
                limit,
                after,
                anchorUtc = anchorUtc?.ToString("o"), // formato round-trip ISO 8601
                userId = _userId,
                search
            };

            var GenericApiResponse = await RequestHelper.GetRequest<CursorPage<RequestHelpResponse>>(URL, queryParams);
            return Ok(GenericApiResponse.Data);
        }

        [HttpGet]
        [Route("ObtenerMisSolicitudesDeAyuda")]
        public async Task<IActionResult> GetMyHelpRequests(
            [FromQuery] int limit = 8,
            [FromQuery] string? after = null,
            [FromQuery] DateTime? anchorUtc = null,
            [FromQuery] string? search = null)
        {
            string URL = ApiForumBaseURL + $"SolicitudAyuda/ObtenerMisSolicitudesDeAyuda";
            var queryParams = new
            {
                limit,
                after,
                anchorUtc = anchorUtc?.ToString("o"),
                userId = _userId,
                search
            };

            var GenericApiResponse = await RequestHelper.GetRequest<CursorPage<RequestHelpResponse>>(URL, queryParams);
            return Ok(GenericApiResponse.Data);
        }

        [HttpGet]
        [Route("SolicitudAyuda/{id:int}/ObtenerDetalleSolicitudAyuda")]
        [AllowAnonymous]
        public async Task<IActionResult> GetDetailRequestsHelp([FromRoute] int id)
        {
            string URL = ApiForumBaseURL + $"SolicitudAyuda/{id}/ObtenerDetalleSolicitudAyuda";
            var queryParams = new
            {
                userId = _userId,
            };

            var GenericApiResponse = await RequestHelper.GetRequest<RequestHelpDetailResponse>(URL, queryParams);
            return Ok(GenericApiResponse.Data);
        }

        [HttpPost]
        [Route("SolicitudAyuda/{id:int}/CancelarSolicitudAyuda")]
        public async Task<IActionResult> CancelHelpRequest([FromBody] CancelHelpRequest request)
        {
            string URL = ApiForumBaseURL + $"SolicitudAyuda/CancelarSolicitudAyuda";
            request.UserId = _userId;
            var GenericApiResponse = await RequestHelper.PostRequest<SuccessfulResponse, CancelHelpRequest>(URL, request);
            return Ok(GenericApiResponse.Data);
        }

        [HttpPost]
        [Route("SolicitudAyuda/{id:int}/CerrarSolicitudAyuda")]
        public async Task<IActionResult> CloseHelpRequest([FromBody] CloseHelpRequest request)
        {
            string URL = ApiForumBaseURL + $"SolicitudAyuda/CerrarSolicitudAyuda";
            request.UserId = _userId;
            var GenericApiResponse = await RequestHelper.PostRequest<SuccessfulResponse, CloseHelpRequest>(URL, request);
            return Ok(GenericApiResponse.Data);
        }

        [HttpGet("SolicitudAyuda/{id:int}/ObtenerChatsDeMiSolicitud")]
        public async Task<IActionResult> GetMyHelpRequestChats([FromRoute] int id)
        {
            string URL = ApiForumBaseURL + $"SolicitudAyuda/{id}/ObtenerChatsDeMiSolicitud";
            var queryParams = new
            {
                id,
                userId = _userId,
            };

            var GenericApiResponse = await RequestHelper.GetRequest<IReadOnlyList<HelpRequestChatsResponse>>(URL, queryParams);
            return Ok(GenericApiResponse.Data);
        }

        [HttpPost("SolicitudAyuda/{id:int}/Chat/Crear")]
        public async Task<IActionResult> CreateChat([FromRoute] int id)
        {
            var url = ApiForumBaseURL + $"SolicitudAyuda/{id}/Chat/Crear";
            var body = new CreateRHChatRequest { UserId = _userId };

            var resp = await RequestHelper.PostRequest<CreateChatResponse, CreateRHChatRequest>(url, body);
            return Ok(resp.Data);
        }

        [HttpGet("SolicitudAyuda/{id:int}/Chat/Mensajes")]
        public async Task<IActionResult> GetRequestHelpChat(
            [FromRoute] int id,
            [FromQuery] int? chatId = null /*, CancellationToken ct */)
                {
                    if (string.IsNullOrWhiteSpace(_userId)) return Unauthorized();
                    if (chatId is null) return BadRequest("chatId is required.");

                    var url = ApiForumBaseURL + $"SolicitudAyuda/{id}/Chat/Mensajes";

                    var qp = new Dictionary<string, object?>
            {
                { "userId", _userId },
                { "chatId", chatId }
            };

            var resp = await RequestHelper.GetRequest<HelpRequestChatDetailResponse>(url, qp /*, ct*/);
            if (!resp.Ok) return StatusCode((int)resp.StatusCode, resp.Error);

            return Ok(resp.Data);
        }

        [HttpPost("SolicitudAyuda/{id:int}/Chat/EnviarMensaje")]
        public async Task<IActionResult> SendChatMessage([FromRoute] int id, [FromBody] SendChatMessageRequest request)
        {
            string URL = ApiForumBaseURL + $"SolicitudAyuda/{id}/Chat/EnviarMensaje";
            request.UserId = _userId;
            var GenericApiResponse = await RequestHelper.PostRequest<ChatMessageResponse, SendChatMessageRequest>(URL, request);
            return Ok(GenericApiResponse.Data);
        }

        [HttpPost("SolicitudAyuda/{id:int}/Chat/Leido")]
        public async Task<IActionResult> MarkChatAsRead([FromRoute] int id, [FromBody] MarkChatReadRequest request)
        {
            string URL = ApiForumBaseURL + $"SolicitudAyuda/{id}/Chat/Leido";
            request.UserId = _userId;
            var GenericApiResponse = await RequestHelper.PostRequest<SuccessfulResponse, MarkChatReadRequest>(URL, request);
            return Ok(GenericApiResponse.Data);
        }

        [HttpGet("SolicitudAyuda/{id:int}/Chat/NoLeido")]
        public async Task<IActionResult> GetUnreadCount([FromRoute] int id, [FromQuery] string userId, [FromQuery] int codeChat)
        {
            string URL = ApiForumBaseURL + $"SolicitudAyuda/{id}/Chat/NoLeido";
            var queryParams = new { userId = _userId, codeChat = codeChat };
            var GenericApiResponse = await RequestHelper.GetRequest<ChatUnreadCountResponse>(URL, queryParams);
            return Ok(GenericApiResponse.Data);
        }
		
-------

Ahora mi controlador de la api de foros (gateway --> foros):

 [Produces("application/json")]
 [ApiController]
 [Route("v1/[controller]")]
 public class SolicitudAyudaController : ControllerBase
 {
     private readonly IMapper _mapper;
     private readonly ILogger<SolicitudAyudaController> _logger;
     private readonly ISolicitudAyudaService _solicitudAyudaService;
     private readonly ISolicitudAyudaChatService _chatService;
     private readonly ISolicitudAyudaChatMensajeService _chatMsgService;

     public SolicitudAyudaController(
         ILogger<SolicitudAyudaController> logger,
         ISolicitudAyudaService solicitudAyudaService,
         ISolicitudAyudaChatService chatService,
         ISolicitudAyudaChatMensajeService chatMsgService,
         IMapper mapper
         )
     {
         _logger = logger;
         _solicitudAyudaService = solicitudAyudaService;
         _chatService = chatService;
         _chatMsgService = chatMsgService;
         _mapper = mapper;
     }

     [HttpPost("CrearSolicitudAyuda")]
     public async Task<IActionResult> CreateHelpRequest([FromBody] CreateHelpRequest request)
     {
         //Validaciones...
         var result = await _solicitudAyudaService.CreateHelpRequest(request);
         return Ok(new SuccessfulResponse(result));
     }

     [HttpGet("ObtenerSolicitudesDeAyuda")]
     public async Task<IActionResult> GetRequestsHelp(
         [FromQuery] int limit = 8,
         [FromQuery] string? after = null,
         [FromQuery] DateTime? anchorUtc = null,
         [FromQuery] string? userId = null,
         [FromQuery] string? search = null)
     {
         var anchor = anchorUtc ?? DateTime.UtcNow;

         (DateTime createdAt, int id)? cursor = null;
         if (!string.IsNullOrWhiteSpace(after))
         {
             var parts = System.Text.Encoding.UTF8.GetString(Convert.FromBase64String(after)).Split(':');
             if (parts.Length == 2 &&
                 long.TryParse(parts[0], out var ticks) &&
                 int.TryParse(parts[1], out var lastId))
             {
                 cursor = (new DateTime(ticks, DateTimeKind.Utc), lastId);
             }
         }

         // Normalización de búsqueda
         search = string.IsNullOrWhiteSpace(search) ? null : search.Trim();
         if (search is { Length: > 100 }) search = search.Substring(0, 100); // anti-abuso

         var page = await _solicitudAyudaService.GetRequestsHelp(limit, anchor, cursor, userId, search);

         var mapped = _mapper.Map<CursorPage<RequestHelpResponse>>(page);
         mapped.AnchorUtc = anchor;
         return Ok(mapped);
     }

     [HttpGet]
     [Route("{id:int}/ObtenerDetalleSolicitudAyuda")]
     public async Task<IActionResult> GetDetailRequestsHelp([FromRoute] int id, [FromQuery] string userId)
     {
         var requestAndChat = await _solicitudAyudaService.GetDetailRequestsHelp(id, userId);
         if (requestAndChat.Item1 == null) return NotFound();
         var dto = _mapper.Map<RequestHelpResponse>(requestAndChat.Item1, opt => { opt.Items["UserId"] = userId; });
         var response = new RequestHelpDetailResponse
         {
             RequestHelp = dto,
             CodeChat = requestAndChat.Item2
         };
         return Ok(response);
     }

     [HttpGet("{id:int}/ObtenerChatsDeMiSolicitud")]
     public async Task<IActionResult> GetMyHelpRequestChats([FromRoute] int id, [FromQuery] string userId)
     {
         var chats = await _chatService.ListMyHelpRequestChatsAsync(userId, id);
         var mapped = _mapper.Map<IEnumerable<HelpRequestChatsResponse>>(chats, opt => opt.Items["UserId"] = userId);
         return Ok(mapped);
     }

     [HttpGet("{id:int}/Chat/Mensajes")]
     public async Task<IActionResult> GetChatMessages(
         [FromRoute] int id,
         [FromQuery] string userId,
         [FromQuery] int chatId)
     {
         var chat = await _chatService.GetRequestHelpChatAsync(id, userId, chatId);

         if (chat == null) return NotFound();

         // Validación de participación (por seguridad, aunque el service ya valida)
         var isParticipant = chat.Participantes.Any(p =>
             p.IDUsuario.Equals(userId, StringComparison.OrdinalIgnoreCase));
         if (!isParticipant) return Forbid(); //Acá vamos a devolver una excepcion de que no tiene permisos para ver este chat

         var dto = _mapper.Map<HelpRequestChatDetailResponse>(chat, opt => { opt.Items["UserId"] = userId;});

         return Ok(dto);
     }

     [HttpPost("{id:int}/Chat/Crear")]
     public async Task<IActionResult> CreateChat(
         [FromRoute] int id,
         [FromBody] CreateRHChatRequest request)
     {
         var chat = await _chatService.CreateChatAsync(id, request.UserId);
         return Ok(new CreateChatResponse { CodeChat = chat });
     }

     [HttpPost("{id:int}/Chat/EnviarMensaje")]
     public async Task<IActionResult> SendChatMessage([FromRoute] int id, [FromBody] SendChatMessageRequest request)
     {
         var normalizedUser = request.UserId.Trim();
         var message = request.Message.TrimStart().TrimEnd();
         if (message.Length == 0)
             return BadRequest("Mensaje vacío");

         var chat = await _chatService.GetRequestHelpChatAsync(id, normalizedUser, request.CodeChat);
         var entity = new SolicitudAyudaChatMensajeModel
         {
             IDChat = chat.IDChat,
             IDUsuario = normalizedUser,
             Mensaje = message
         };

         await _chatMsgService.CreateAsync(entity);

         entity.LeidoPorUsuarioActual = true;
         var response = _mapper.Map<ChatMessageResponse>(entity, opt => opt.Items["UserId"] = normalizedUser);
         response.SentByMe = true;
         return Ok(response);
     }

     [HttpPost("{id:int}/Chat/Leido")]
     public async Task<IActionResult> MarkChatAsRead([FromRoute] int id, [FromBody] MarkChatReadRequest request)
     {
         if (request == null || string.IsNullOrWhiteSpace(request.UserId))
             return BadRequest("Datos inválidos");

         var normalizedUser = request.UserId.Trim();

         var chat = await _chatService.GetByRequestCodeAndChatCodeAsync(id, request.CodeChat);
         if (chat == null)
             return NotFound("Chat no encontrado");

         int affected = 0;

         if (request.UpToUtc.HasValue)
             affected = await _chatMsgService.MarkAllAsReadUpToAsync(chat.IDChat, normalizedUser, request.UpToUtc.Value);
         else if (request.MessageIds != null && request.MessageIds.Count > 0)
             affected = await _chatMsgService.MarkAsReadAsync(chat.IDChat, normalizedUser, request.MessageIds);

         return Ok(new SuccessfulResponse(affected >= 0));
     }

     [HttpGet("{id:int}/Chat/NoLeido")]
     public async Task<IActionResult> GetUnreadCount([FromRoute] int id, [FromQuery] string userId, [FromQuery] int codeChat)
     {
         var normalizedUser = userId.Trim();

         var chat = await _chatService.GetByRequestCodeAndChatCodeAsync(id, codeChat);
         if (chat == null)
             return NotFound("Chat no encontrado");

         var count = await _chatMsgService.CountUnreadAsync(chat.IDChat, normalizedUser);
         return Ok(new ChatUnreadCountResponse { Count = count });
     }
 }
 
 -----
 
     public class SolicitudAyudaChatService : GenericService<SolicitudAyudaChatModel>, ISolicitudAyudaChatService
    {
        private readonly ISolicitudAyudaChatRepository _chatRepo;
        private readonly ISolicitudAyudaRepository _solRepo;
        private readonly IUnitOfWorkGateway _unitOfWorkGateway;

        private static readonly StringComparison UserComparison = StringComparison.OrdinalIgnoreCase;

        public SolicitudAyudaChatService(
            IUnitOfWorkForum unitOfWork,
            IUnitOfWorkGateway unitOfWorkGateway
        ) : base(unitOfWork, unitOfWork.GetRepository<ISolicitudAyudaChatRepository>())
        {
            _chatRepo = unitOfWork.GetRepository<ISolicitudAyudaChatRepository>();
            _solRepo = unitOfWork.GetRepository<ISolicitudAyudaRepository>();
            _unitOfWorkGateway = unitOfWorkGateway;
        }

        public async Task<int> CreateChatAsync(int requestCode, string userId)
        {
            var requestHelp = (await _solRepo.Get(x => x.IDSolicitudAyuda == requestCode, tracking: false)).FirstOrDefault();
            if (requestHelp == null) throw new ArgumentException("No se encontró la solicitud de ayuda.", nameof(requestCode));

            // Evitar chat con uno mismo
            if (string.Equals(requestHelp.IDUsuarioSolicitante, userId, StringComparison.OrdinalIgnoreCase))
                throw new ArgumentException("El solicitante no puede iniciar un chat consigo mismo.", nameof(userId));

            // Idempotencia: si ya existe, devolvelo
            var existing = (await _chatRepo.Get(
                c => c.IDSolicitudAyuda == requestCode && c.IDUsuarioAyudante == userId,
                tracking: false)).FirstOrDefault();
            if (existing != null) return existing.IDChat;

            var chat = new SolicitudAyudaChatModel
            {
                IDSolicitudAyuda = requestCode,
                IDUsuarioAyudante = userId,
                Active = true,
                CreateDate = DateTime.UtcNow,
                Solicitud = requestHelp
            };

            await _chatRepo.Insert(chat);
            await _unitOfWork.SaveChangesAsync();
            return chat.IDChat;
        }


        public async Task<SolicitudAyudaChatModel?> GetByRequestCodeAndChatCodeAsync(int codeRequest, int codeChat)
        {
            var chat = (await _chatRepo.Get(c => c.IDSolicitudAyuda == codeRequest && c.IDChat == codeChat, includeProperties: "Solicitud", tracking: false)).FirstOrDefault();
            return chat;
        }

        public async Task<SolicitudAyudaChatModel> GetRequestHelpChatAsync(int idSolicitud, string userId, int chatCode)
        {
            var normalizedUserId = NormalizeUserId(userId, nameof(userId));

            var chat = (await _chatRepo.Get(c => c.IDSolicitudAyuda == idSolicitud && c.IDChat == chatCode, includeProperties: "Solicitud,Mensajes", tracking: true)).FirstOrDefault();
            if(chat is null)
                throw new ArgumentException("No se encontró el chat indicado para la solicitud de ayuda.", nameof(chatCode));

            chat.UsuarioAyudante = (await _unitOfWorkGateway.GetRepository<IUsersRepository>()
                .Get(u => u.Id == chat.IDUsuarioAyudante, includeProperties: "UsersForum")).FirstOrDefault();

            return chat;
        }

        public async Task<IReadOnlyList<SolicitudAyudaChatModel>> ListMyHelpRequestChatsAsync(string userId, int idRequest)
        {
            var normalizedUser = NormalizeUserId(userId, nameof(userId));

            var chats = await _chatRepo.Get(
                c => c.Solicitud.IDUsuarioSolicitante == normalizedUser && c.IDSolicitudAyuda == idRequest,
                orderBy: q => q.OrderByDescending(c => c.CreateDate).ThenByDescending(c => c.IDChat),
                includeProperties: "Solicitud,Mensajes,Mensajes.Lecturas,Participantes,Participantes.Usuario,Solicitud.SolicitudAyudaEstado",
                tracking: false);

            // Batch lookup de ayudantes
            var helperIds = chats.Select(c => c.IDUsuarioAyudante).Distinct(StringComparer.OrdinalIgnoreCase).ToList();
            var usersRepo = _unitOfWorkGateway.GetRepository<IUsersRepository>();
            var helpers = (await usersRepo.Get(u => helperIds.Contains(u.Id), includeProperties: "UsersForum", tracking: false))
                          .ToDictionary(u => u.Id, StringComparer.OrdinalIgnoreCase);

            foreach (var chat in chats)
                if (helpers.TryGetValue(chat.IDUsuarioAyudante, out var user))
                    chat.UsuarioAyudante = user;

            return chats.ToList();
        }

        private static string NormalizeUserId(string value, string paramName)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                throw new ArgumentException("Valor requerido", paramName);
            }

            return value.Trim();
        }
    }
	
------

using Core.Contracts.Repositories;
using Core.Contracts.Services;
using Core.Contracts.UoW;
using Core.Domain.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Core.Business.Services
{
    public class SolicitudAyudaChatMensajeService : GenericService<SolicitudAyudaChatMensajeModel>, ISolicitudAyudaChatMensajeService
    {
        private readonly ISolicitudAyudaChatMensajeRepository _msgRepo;
        private readonly ISolicitudAyudaChatMensajeLecturaRepository _readRepo;
        private readonly ISolicitudAyudaChatRepository _chatRepo;

        private static readonly StringComparison UserComparison = StringComparison.OrdinalIgnoreCase;

        public SolicitudAyudaChatMensajeService(
            IUnitOfWorkForum unitOfWork
        ) : base(unitOfWork, unitOfWork.GetRepository<ISolicitudAyudaChatMensajeRepository>())
        {
            _msgRepo = unitOfWork.GetRepository<ISolicitudAyudaChatMensajeRepository>();
            _readRepo = unitOfWork.GetRepository<ISolicitudAyudaChatMensajeLecturaRepository>();
            _chatRepo = unitOfWork.GetRepository<ISolicitudAyudaChatRepository>();
        }

        public override async Task CreateAsync(SolicitudAyudaChatMensajeModel entity)
        {
            if (entity == null)
            {
                throw new ArgumentNullException(nameof(entity));
            }

            entity.IDUsuario = NormalizeUserId(entity.IDUsuario, nameof(entity.IDUsuario));
            entity.Mensaje = (entity.Mensaje ?? string.Empty).Trim();
            if (entity.Mensaje.Length == 0)
            {
                throw new ArgumentException("Mensaje requerido", nameof(entity.Mensaje));
            }

            var chat = await GetChatAsync(entity.IDChat);
            EnsureParticipant(chat, entity.IDUsuario);

            await base.CreateAsync(entity);
        }

        public async Task<IReadOnlyList<SolicitudAyudaChatMensajeModel>> GetMessagesAsync(int idChat, DateTime? afterUtc, int take, bool ascending, string currentUserId)
        {
            var normalizedUser = NormalizeUserId(currentUserId, nameof(currentUserId));
            var chat = await GetChatAsync(idChat);
            EnsureParticipant(chat, normalizedUser);

            if (take <= 0) take = 50;

            var q = _msgRepo.Query(m => m.IDChat == idChat, tracking: false);

            if (afterUtc.HasValue)
                q = q.Where(m => m.CreateDate > afterUtc.Value);

            q = ascending
                ? q.OrderBy(m => m.CreateDate).ThenBy(m => m.IDMensaje)
                : q.OrderByDescending(m => m.CreateDate).ThenByDescending(m => m.IDMensaje);

            var list = q.Take(take).ToList();

            var ids = list.Select(m => m.IDMensaje).ToList();
            if (ids.Count > 0)
            {
                var read = await _readRepo.Get(r => r.IDUsuario == normalizedUser && ids.Contains(r.IDMensaje), tracking: false);
                var readSet = read.Select(r => r.IDMensaje).ToHashSet();
                foreach (var m in list)
                    m.LeidoPorUsuarioActual = readSet.Contains(m.IDMensaje);
            }

            return list;
        }

        public async Task<int> MarkAsReadAsync(int idChat, string userId, IEnumerable<int> messageIds)
        {
            var normalizedUser = NormalizeUserId(userId, nameof(userId));
            var chat = await GetChatAsync(idChat);
            EnsureParticipant(chat, normalizedUser);

            return await MarkAsReadInternalAsync(chat, normalizedUser, messageIds);
        }

        public async Task<int> MarkAllAsReadUpToAsync(int idChat, string userId, DateTime upToUtc)
        {
            var normalizedUser = NormalizeUserId(userId, nameof(userId));
            var chat = await GetChatAsync(idChat);
            EnsureParticipant(chat, normalizedUser);

            var msgs = _msgRepo.Query(m => m.IDChat == idChat && m.IDUsuario != normalizedUser && m.CreateDate <= upToUtc, tracking: false)
                               .Select(m => m.IDMensaje)
                               .ToList();

            return await MarkAsReadInternalAsync(chat, normalizedUser, msgs);
        }

        public async Task<int> CountUnreadAsync(int idChat, string userId)
        {
            var normalizedUser = NormalizeUserId(userId, nameof(userId));
            var chat = await GetChatAsync(idChat);
            EnsureParticipant(chat, normalizedUser);

            // Count messages from others without a read receipt for this user
            var q = from m in _msgRepo.Query(m => m.IDChat == idChat && m.IDUsuario != normalizedUser, tracking: false)
                    join r in _readRepo.Query(r => r.IDUsuario == normalizedUser, tracking: false)
                        on m.IDMensaje equals r.IDMensaje into gj
                    from r in gj.DefaultIfEmpty()
                    where r == null
                    select m.IDMensaje;

            return q.Count();
        }

        private async Task<int> MarkAsReadInternalAsync(SolicitudAyudaChatModel chat, string normalizedUser, IEnumerable<int> messageIds)
        {
            var ids = messageIds?.Distinct().ToList() ?? new List<int>();
            if (ids.Count == 0)
            {
                return 0;
            }

            var msgs = _msgRepo.Query(m => m.IDChat == chat.IDChat && ids.Contains(m.IDMensaje) && m.IDUsuario != normalizedUser, tracking: false)
                               .Select(m => m.IDMensaje)
                               .ToList();

            if (msgs.Count == 0)
            {
                return 0;
            }

            var already = await _readRepo.Get(r => r.IDUsuario == normalizedUser && msgs.Contains(r.IDMensaje), tracking: false);
            var alreadySet = already.Select(r => r.IDMensaje).ToHashSet();

            var toInsert = msgs.Where(id => !alreadySet.Contains(id))
                               .Select(id => new SolicitudAyudaChatMensajeLecturaModel
                               {
                                   IDMensaje = id,
                                   IDUsuario = normalizedUser,
                               })
                               .ToList();

            if (toInsert.Count > 0)
            {
                await _readRepo.Insert(toInsert);
                await _unitOfWork.SaveChangesAsync();
            }

            return toInsert.Count;
        }

        private async Task<SolicitudAyudaChatModel> GetChatAsync(int idChat)
        {
            var chats = await _chatRepo.Get(c => c.IDChat == idChat, includeProperties: "Solicitud", tracking: false);
            var chat = chats.FirstOrDefault();
            if (chat == null)
            {
                throw new ArgumentException("Chat no encontrado", nameof(idChat));
            }

            if (chat.Solicitud == null)
            {
                throw new InvalidOperationException("La solicitud asociada al chat no se encuentra cargada.");
            }

            return chat;
        }

        private static void EnsureParticipant(SolicitudAyudaChatModel chat, string userId)
        {
            if (!string.Equals(chat.IDUsuarioAyudante, userId, UserComparison) &&
                !string.Equals(chat.Solicitud.IDUsuarioSolicitante, userId, UserComparison))
            {
                throw new InvalidOperationException("El usuario no participa del chat solicitado.");
            }
        }

        private static string NormalizeUserId(string value, string paramName)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                throw new ArgumentException("Valor requerido", paramName);
            }

            return value.Trim();
        }
    }
}


------

        public async Task<(SolicitudAyudaModel, int?)> GetDetailRequestsHelp(int codeRequest, string codeUser)
        {
            var requestHelp = (await _repository.Get(x=> x.IDSolicitudAyuda == codeRequest, includeProperties: "SolicitudAyudaEstado,SolicitudAyudaEtiquetas.Etiqueta,Disponibilidades,Chats")).FirstOrDefault();
            if (requestHelp == null)
                throw new ApiForumException("No se encontró la solicitud de ayuda indicada.");

            requestHelp.UsuarioSolicitante = (await _usersRepository.Get(x => x.Id == requestHelp.IDUsuarioSolicitante, tracking: false, includeProperties: "UsersForum")).FirstOrDefault();

            var chat = requestHelp.Chats.FirstOrDefault(c => c.IDUsuarioAyudante == codeUser && c.Active);
            return (requestHelp, chat?.IDChat);
        }
		
-------
Bien, te pase los servicios para que entiendas un poco el negocio, vos recordá que lo que importa es la gateway ya que vos siempre armas los servicios para pegarle a esos end. La gateway siempre
se encarga de insertar el userId.

Ahora te paso los responses para que armes las clases typeScript:

    public class RequestHelpDetailResponse
    {
        public RequestHelpResponse RequestHelp { get; set; }
        public int? CodeChat { get; set; }
    }
	
	    public class RequestHelpResponse
    {
        public UsersForumPreviewResponse UserCreator { get; set; }
        public int CodeRequestHelp { get; set; }
        public string TitleHelp { get; set; }
        public string Message { get; set; }
        public string Status { get; set; }
        public List<string> Languages { get; set; }
        public List<string> Labels { get; set; }
        public DateTime CreatedAt { get; set; }
        public decimal Regard { get; set; }
        public DateTime ExpiresAt { get; set; }
        public RequestHelpTimeSlot TimeSlot { get; set; }
    }

    public class RequestHelpTimeSlot
    {
        public List<TimeSlotItem> Slots { get; set; }
    }

    public class TimeSlotItem
    {
        public DateTime Start { get; set; }
        public DateTime End { get; set; }
    }
	
	public class CancelHelpRequest
    {
        public int CodeRequestHelp { get; set; }
        public string? Reason { get; set; }
        public string? UserId { get; set; }
    }
	
	public class CloseHelpRequest
    {
        public int CodeRequestHelp { get; set; }
        public string? UserId { get; set; }
    }
	
	    public class CreateRHChatRequest
    {
        public string UserId { get; set; }
    }
	
	 public sealed class HelpRequestChatDetailResponse
 {
     public int ChatCode { get; set; }
     public int RequestCode { get; set; }
     public string State { get; set; } = "Abierto";
     public DateTime CreatedAt { get; set; }
     public bool Active { get; set; }

     public UsersForumPreviewResponse Other { get; set; } = null!;

     public int UnreadCount { get; set; }
     public IEnumerable<MessageView> Messages { get; set; } = Array.Empty<MessageView>();

     public sealed class MessageView
     {
         public int CodeMessage { get; set; }
         public string Text { get; set; } = "";
         public DateTime At { get; set; }
         public bool FromMe { get; set; }
         public bool ReadByOther { get; set; }
     }
 }
 
     public class SendChatMessageRequest
    {
        public string? UserId { get; set; } = null!;
        public int CodeChat { get; set; }
        public string Message { get; set; } = null!;
    }
	
	    public class ChatMessageResponse
    {
        public int CodeMessage { get; set; }
        public int CodeChat { get; set; }
        public string Message { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool Readed { get; set; }
        public bool SentByMe { get; set; }
    }
	
	    public class MarkChatReadRequest
    {
        public string? UserId { get; set; } = null!;
        public int CodeChat { get; set; }
        public DateTime? UpToUtc { get; set; }
        public List<int>? MessageIds { get; set; }
    }
	
	    public class ChatUnreadCountResponse
    {
        public int Count { get; set; }
    }
	
------

La idea es la siguiente. El "ayudado" puede ver todos los chats que le mandan las personas, los chats son de manera PRIVADA.
-De lado de vista del "ayudado" cuando entro a alguna solicitud mía quiero traerme todos los mensajes tipo whatsapp y si entro a alguno en especial traigo todo el historial de chat (la vista de whatsapp solo muestra ultimo mensaje cortado y numero de mensajes no leidos) 
-De lado de vista "ayudante" quiero que cuando entre a una solicitud llame al servicio de obtener detalle y si manda un mensaje que invoque el endpoint para crear/obtener chat y llamar al enviar mensaje etc etc.

La idea es que cuando alguien entre al detalle de la solicitud invoque el end, y luego si manda mensajes que invoque el de mandar mensaje, que si es primer mensaje mande el booleano createBefore en true y etc... tenes todo el contexto con todo lo que te pasé.
Preguntá lo que necesites, y si estas seguro mandale cohete!! Rompela, ganale a la UI de whatsapp, se que sos el mejor y experto en esto.

---

# PROMPT DE IMPLEMENTACIÓN (para un agente de código)

Rol: Sos un desarrollador full‑stack senior en Next.js 14 + React + TypeScript con React Query, Zustand y SignalR. Tenés que alinear el front a la nueva API (gateway → foros) y entregar una experiencia de chat tipo WhatsApp para “Live Help”, contemplando los dos roles: “ayudado” (dueño de la solicitud) y “ayudante”.

Contexto clave:
- El gateway resuelve/inyecta `userId`; no lo envíes desde el front salvo cuando la API lo requiera explícitamente.
- Endpoints y contratos C# están arriba en este archivo. Mapeá 1:1 a tipos TypeScript y servicios.
- Señales en tiempo real: ya existe un hook `useLiveHelpChatSignalR` que te da `connectionId` y callbacks.

Objetivo general:
- Alinear servicios, tipos y páginas a los endpoints nuevos del gateway y del micro de foros, soportando:
  - Vista “ayudado”: lista de chats de su solicitud, último mensaje truncado, contador de no leídos, y detalle con historial y envío.
  - Vista “ayudante”: al entrar al detalle puede iniciar chat y enviar su primer mensaje (crear si no existe y luego enviar), ver historial y marcar leído.

Alcance técnico (hacer):
1) Tipos TypeScript (unificar contrato con la API)
   - Archivo: `src/lib/types/forum.ts:1`
   - Agregar/ajustar tipos siguientes (nombres en camelCase, propiedades según C# provisto):
     - `RequestHelpDetailResponse` con `{ requestHelp: RequestHelpResponse; codeChat?: number | null }`.
     - `RequestHelpResponse` (ya existe). Asegurar coincide con el contrato (propiedades de casing estable: usar camelCase en TS; manejar en el mapeo cualquier snake/pascal del back).
     - `RequestHelpTimeSlot` y `TimeSlotItem` equivalentes a C# (usar strings ISO para fechas en TS).
     - `HelpRequestChatDetailResponse` con:
       - `chatCode: number; requestCode: number; state: string; createdAt: string; active: boolean; other: UsersForumPreviewResponse; unreadCount: number; messages: MessageView[]`.
       - `MessageView` con `{ codeMessage: number; text: string; at: string; fromMe: boolean; readByOther: boolean }`.
     - `CreateRHChatRequest` con `{ userId: string }` (solo si se requiere explícito; gateway suele inyectar).
     - `SendChatMessageRequest` con `{ codeChat: number; message: string; connectionId?: string | null }`.
     - `MarkChatReadRequest` con `{ codeChat: number; upToUtc?: string; messageIds?: number[] }`.
     - `ChatUnreadCountResponse` con `{ count: number }`.
   - Nota: Si hoy existen variantes con nombres distintos (p. ej. `unreadCount`), reemplazar por los definitivos arriba y ajustar usos.

2) Servicios HTTP (alinear a gateway actualizado)
   - Base: `src/lib/services/forum`
   - Actualizar/crear funciones en:
     - `requestHelpService.ts:1`
       - `getRequestsHelp(limit, after?, anchorUtc?, search?)` (existe, validar path `ApiForum/ObtenerSolicitudesDeAyuda`).
       - `getMyHelpRequests(limit, after?, anchorUtc?, search?)` → `GET ApiForum/ObtenerMisSolicitudesDeAyuda`.
       - `getRequestHelpDetail(requestId)` → `GET ApiForum/SolicitudAyuda/{id}/ObtenerDetalleSolicitudAyuda`.
       - `cancelHelpRequest(req: { codeRequestHelp: number; reason?: string })` → `POST ApiForum/SolicitudAyuda/{id}/CancelarSolicitudAyuda`.
       - `closeHelpRequest(req: { codeRequestHelp: number })` → `POST ApiForum/SolicitudAyuda/{id}/CerrarSolicitudAyuda`.
     - `liveHelpChatService.ts:1` (reemplazar implementación para ajustarla):
       - `listMyRequestChats(requestId)` → `GET ApiForum/SolicitudAyuda/{id}/ObtenerChatsDeMiSolicitud` devuelve `HelpRequestChatsResponse[]` (definí el tipo con mínimo: `chatCode: number; other: UsersForumPreviewResponse; lastText?: string; lastAt?: string; unreadCount: number`).
     - `getChatDetail(requestId, chatId)` → `GET ApiForum/SolicitudAyuda/{id}/Chat/Mensajes?chatId=...` y devuelve `HelpRequestChatDetailResponse`.
     - `createChat(requestId)` → `POST ApiForum/SolicitudAyuda/{id}/Chat/Crear` devuelve `{ codeChat: number }` (o un número). Usar solo cuando el usuario envía el primer mensaje.
       - `sendChatMessage(requestId, body: SendChatMessageRequest)` → `POST ApiForum/SolicitudAyuda/{id}/Chat/EnviarMensaje` devuelve `ChatMessageResponse`.
       - `markChatAsRead(requestId, body: MarkChatReadRequest)` → `POST ApiForum/SolicitudAyuda/{id}/Chat/Leido`.
       - `getUnreadCount(requestId, codeChat)` → `GET ApiForum/SolicitudAyuda/{id}/Chat/NoLeido?codeChat=...` devuelve `{ count }`.
   - Todos los requests con `requireCredentials: true` (cookies/sesión).

3) Detalle de la página (chat end‑to‑end)
   - Archivo base: `src/app/forum/liveHelp/detail/[id]/page.tsx:1`
   - Reemplazar el flujo actual para ajustarlo a los endpoints nuevos:
     - Al montar, llamar `getRequestHelpDetail(id)` y guardar `requestHelp` y `codeChat` si viene.
     - Cargar historial de chat: si hay `codeChat`, invocar inmediatamente `getChatDetail(id, codeChat)` y mostrar un loading destacado (overlay/centrado) en el panel de mensajería.
     - Si `getChatDetail` falla, mostrar un estado de error en el centro del panel con ícono y botón “Reintentar” que vuelva a invocar `getChatDetail(id, codeChat)`.
     - Si es “ayudante” y no hay chat aún, el input puede estar habilitado; al enviar el primer mensaje:
       1) Llamar `createChat(id)` para obtener `codeChat`.
       2) Luego `sendChatMessage(id, { codeChat, message, connectionId })`.
     - Envío optimista ya existe; ajustar para requerir `codeChat` en `sendChatMessage`.
     - Marcado como leído: cada vez que recibas/visualices mensajes del “otro”, llamar `markChatAsRead(id, { codeChat, upToUtc: lastOther.at })`.
     - Contador no leídos: opcionalmente, refrescar con `getUnreadCount(id, codeChat)` en intervalos o al foco.
   - Mantener el mapeo defensivo de mensajes (case-insensitive/variantes), pero ahora usando `HelpRequestChatDetailResponse.MessageView`:
     - `text` ⇔ `Text`, `at` ⇔ `At`, `fromMe` ⇔ `FromMe`, `readByOther` ⇔ `ReadByOther`.

4) Vista “ayudado” (lista tipo WhatsApp)
   - En el mismo detalle o como subcomponente, mostrar la lista de chats para la solicitud actual:
     - Fuente: `listMyRequestChats(requestId)`.
     - Ítems: avatar/nombre de `other`, `lastText` truncado, `unreadCount`, y hora `lastAt`.
     - Al seleccionar, cargar `getChatDetail(requestId, { chatId })` y fijar `codeChat` activo.
   - Accesibilidad básica: `aria-live` en el contenedor de mensajes, `aria-pressed` en selección.

5) SignalR
   - Hook disponible: `src/hooks/signalR/useLiveHelpChatSignalR.ts:1`.
   - Usar `connectionId` retornado para incluirlo en `sendChatMessage` (si el back lo aprovecha) y escuchar eventos:
     - `onMessageAdded` → agregar mensaje al historial (evitar duplicados por id).
     - `onChatRead` → marcar mensajes propios como leídos.

6) Estilos y UX
   - Respetar clases existentes en `src/app/forum/liveHelp/detail/[id]/page.module.css:1`.
   - Burbujas, ticks de estado (enviando/entregado/leído) y autoscroll ya están; mantener comportamiento.

7) Errores y estados
   - Mostrar toast en fallas de envío/lectura.
   - Deshabilitar input si la solicitud está cerrada o expirada (si `status`/`expiresAt` lo indican).

Criterios de aceptación:
- Tipos TS actualizados y consistentes con C# de este archivo.
- Servicios alineados a rutas del gateway nuevas, sin endpoints legacy (`.../Chat/Mensajes` POST deja de usarse para enviar; ahora es `.../Chat/EnviarMensaje`).
- Detalle `[id]` carga el `RequestHelpDetailResponse`, si retorna `codeChat` dispara la carga inmediata del historial con un “super loading” en el panel; si falla, muestra error con botón “Reintentar”; al recuperar mensajes permite enviar (crea chat si hace falta) y marca leído.
- Vista “ayudado” lista sus chats con último mensaje y contador de no leídos; al hacer clic, abre historial.
- Señales en tiempo real actualizan el historial y el estado leído.
- Sin agregar librerías nuevas ni romper otras features.

Notas de implementación:
- Donde el back pueda variar el casing de propiedades, usá mapeos defensivos (como el helper existente en la página) para no romper si cambia de `PascalCase` a `camelCase`.
- El gateway resuelve `userId`; no pases ese valor desde el cliente salvo que el endpoint lo pida explícitamente.
- Si `HelpRequestChatsResponse` no está tipado aún, crealo con lo mínimo necesario y documentá qué campos se consumen en la UI.

Entrega esperada (en este repo):
- Cambios en: `src/lib/types/forum.ts:1`, `src/lib/services/forum/requestHelpService.ts:1`, `src/lib/services/forum/liveHelpChatService.ts:1`, `src/app/forum/liveHelp/detail/[id]/page.tsx:1`, y opcionalmente nuevos subcomponentes para la lista de chats.

Si algo no está claro, preguntá antes de avanzar.
