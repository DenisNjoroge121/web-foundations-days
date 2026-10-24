
# SnapShare: Photo App Scaling Plan

## 1. Assumptions

SnapShare is a photo-sharing application where users upload photos and scroll through a feed containing photos from people they follow.

The following assumptions are used for the estimates:

- Registered users: 10 million.
- Daily active users (DAU): 10% of registered users.
- Each daily active user uploads one photo per day.
- Each daily active user views 50 feed pages per day.
- Average original photo size: 2 MB.
- Average thumbnail size: 50 KB per photo.
- One year has 365 days.
- User activity is distributed evenly across 24 hours when calculating average request rates.
- Peak feed traffic is five times the average feed traffic.
- All uploaded originals and thumbnails are retained for one year, with no deletions.
- Storage estimates use decimal units: 1 TB = 1,000,000 MB.
- Storage estimates exclude database metadata, backups, replication, temporary files, and other infrastructure overhead.

## 2. Traffic and Storage Estimates

### Daily active users

Daily active users are 10% of 10 million registered users.

DAU = 10,000,000 × 0.10

**Daily active users = 1,000,000 users**

### Uploads per second

Each active user uploads one photo per day.

Daily uploads = 1,000,000 × 1

Daily uploads = 1,000,000 photos

Average uploads per second = 1,000,000 ÷ 86,400

**Average uploads = approximately 11.6 photos per second**

### Feed views per second

Each active user views 50 feed pages per day.

Daily feed views = 1,000,000 × 50

Daily feed views = 50,000,000 feed pages

Average feed views per second = 50,000,000 ÷ 86,400

**Average feed views = approximately 579 per second**

Peak feed views per second = 579 × 5

**Peak feed views = approximately 2,895 per second**

These figures represent feed-page requests, not the number of individual photos delivered. Each feed page may contain several photos.

### Photo storage per year

Each photo produces two stored files:

- Original photo: 2 MB
- Thumbnail: 50 KB = 0.05 MB

Total storage per uploaded photo = 2 + 0.05 = 2.05 MB

Annual uploads = 1,000,000 × 365

**Annual uploads = 365,000,000 photos**

Original photo storage per year:

365,000,000 × 2 MB = 730,000,000 MB

Original storage = **730 TB per year**

Thumbnail storage per year:

365,000,000 × 0.05 MB = 18,250,000 MB

Thumbnail storage = **18.25 TB per year**

Total annual storage:

730 TB + 18.25 TB = 748.25 TB

**Total photo storage = approximately 748.25 TB per year**, excluding overhead and additional copies.

| Metric | Estimate |
|---|---:|
| Registered users | 10 million |
| Daily active users | 1 million |
| Daily uploads | 1 million |
| Average uploads per second | 11.6 |
| Daily feed views | 50 million |
| Average feed views per second | 579 |
| Peak feed views per second | 2,895 |
| Original storage per year | 730 TB |
| Thumbnail storage per year | 18.25 TB |
| Total storage per year | 748.25 TB |

## 3. Is SnapShare Read-Heavy or Write-Heavy?

SnapShare is **read-heavy** because each active user views 50 feed pages for every photo they upload. This creates approximately 50 million daily feed-page views compared with 1 million daily photo uploads.

The architecture should therefore prioritize fast feed delivery, caching, and efficient database reads. A CDN can serve frequently requested photo files, a cache can store frequently accessed feed data, and a database read replica can handle read queries without sending every query to the primary database.

The system must still handle uploads reliably, but feed reads are expected to dominate normal application traffic.

## 4. Where Should Photos Be Stored?

Photo files should be stored in object storage rather than directly inside the relational database.

Storing large binary files in a database would increase database size, backups, and storage costs, while competing with important queries for database resources. Object storage is designed to store and retrieve large files independently and can scale to hundreds of terabytes or more.

The database should store photo metadata, such as the photo ID, owner ID, caption, upload timestamp, object-storage key, and thumbnail key. The original image and thumbnail should be stored in object storage, while the CDN delivers those files efficiently to users.

## 5. Proposed Architecture Diagram

```text
                    +-----------------------+
                    |         Users         |
                    | Mobile App / Browser  |
                    +-----------+-----------+
                                |
                                v
                    +-----------------------+
                    |          CDN          |
                    | Cached images/thumbnails
                    +-----------+-----------+
                                |
                                v
                    +-----------------------+
                    |     Load Balancer     |
                    +-----------+-----------+
                                |
                 +--------------+--------------+
                 |              |              |
                 v              v              v
           +-----------+  +-----------+  +-----------+
           | App       |  | App       |  | App       |
           | Server 1  |  | Server 2  |  | Server 3  |
           +-----+-----+  +-----+-----+  +-----+-----+
                 |              |              |
                 +--------------+--------------+
                                |
                  +-------------+-------------+
                  |                           |
                  v                           v
          +---------------+          +------------------+
          | Cache         |          | Primary Database |
          | Feed data     |          | Users, follows,  |
          | Hot metadata  |          | photo metadata   |
          +---------------+          +--------+---------+
                                               |
                                               | Replication
                                               v
                                      +------------------+
                                      | Database Read    |
                                      | Replica          |
                                      +------------------+

        Upload and thumbnail processing:

           App Server
                |
                +--------------------------+
                |                          |
                v                          v
       +------------------+       +------------------+
       | Object Storage   |       | Message Queue    |
       | Original photos  |       | Thumbnail jobs   |
       | Thumbnails       |       +--------+---------+
       +--------+---------+                |
                ^                          v
                |                 +------------------+
                +-----------------| Thumbnail Worker |
                                  | Resize/compress  |
                                  +------------------+
```

## 6. What Each Component Does

- **Users:** Upload photos and request feeds through a browser or mobile application.
- **CDN:** Serves cached photos and thumbnails from locations closer to users, reducing latency and load on the origin storage.
- **Load balancer:** Distributes incoming application requests across healthy app servers to prevent one server from becoming overloaded.
- **App servers:** Handle authentication, upload authorization, feed generation, validation, and business logic while allowing more servers to be added as traffic grows.
- **Cache:** Stores frequently accessed feed data and metadata so the application does not need to repeat expensive database queries for every request.
- **Primary database:** Stores authoritative structured data, including users, follow relationships, photo metadata, and upload records.
- **Database read replica:** Handles eligible read queries to reduce the primary database's workload while receiving replicated data from the primary.
- **Object storage:** Stores original photos and generated thumbnails separately from the database, allowing photo storage to scale independently.
- **Message queue:** Holds thumbnail-generation jobs so uploads can finish without waiting for image processing to complete.
- **Thumbnail worker:** Processes queued jobs asynchronously to resize and compress images, then stores the resulting thumbnails in object storage.

## 7. Step-by-Step Photo Upload Flow

1. **User selects a photo:** The user chooses an image and submits it through the SnapShare application.

2. **Request reaches the app:** The load balancer routes the request to a healthy app server.

3. **Validate and authorize:** The app server checks the user's authentication, upload permissions, file type, and file size.

4. **Prepare storage:** The app server creates an upload record or reserves a photo ID and generates a secure, short-lived upload URL for object storage.

5. **Upload the original:** The client uploads the original photo directly to object storage using the authorized URL, reducing the amount of large file data passing through the app servers.

6. **Confirm the upload:** After the upload succeeds, the application confirms that the object exists and records or updates its storage key and status in the primary database.

7. **Queue thumbnail processing:** The app server publishes a thumbnail-generation job containing the photo ID and object-storage key to the message queue.

8. **Acknowledge the upload:** The user receives confirmation that the photo has been uploaded; thumbnail generation can continue in the background.

9. **Worker processes the image:** A thumbnail worker consumes the queued job, downloads or reads the original photo, resizes and compresses it, and creates a 50 KB thumbnail where feasible.

10. **Store the thumbnail:** The worker uploads the thumbnail to object storage and updates the photo metadata to indicate that processing is complete.

11. **Deliver the photo:** The application can return the photo's metadata and CDN URL to users, serving the thumbnail for feed previews and the original when needed.

12. **Handle failures:** Failed thumbnail jobs are retried, and repeatedly failing jobs can be moved to a dead-letter queue for investigation.

## 8. Important Trade-Offs

### Trade-off 1: Caching versus fresh data

Caching feed data improves response times and reduces database load. However, cached feeds may briefly show outdated information after a user uploads a photo or follows someone new.

**Decision:** Use a short cache lifetime or targeted cache invalidation for affected feeds. This balances speed with acceptable freshness.

### Trade-off 2: Direct uploads versus proxying through app servers

Direct uploads from the client to object storage reduce bandwidth and processing pressure on app servers. However, they require secure upload URLs, upload-completion checks, and careful validation of stored files.

**Decision:** Use short-lived, restricted upload URLs and verify uploaded objects before marking a photo as available.

### Trade-off 3: Asynchronous thumbnails versus immediate availability

A queue and background worker keep upload requests fast and allow thumbnail processing to scale independently. However, thumbnails may not be available immediately after an upload, and jobs can fail or be delayed.

**Decision:** Show an upload-pending or processing state until the thumbnail is ready, and use retries and monitoring to handle failures.

### Trade-off 4: Read replicas versus perfectly fresh reads

A read replica increases read capacity and reduces pressure on the primary database. However, replication can lag, so a recently uploaded photo may not immediately appear in queries served by the replica.

**Decision:** Use the primary database for operations that require immediate consistency, while directing suitable feed and browsing queries to the read replica.

### Trade-off 5: Storage cost versus image quality

Keeping original photos and thumbnails provides good viewing quality and fast feed loading, but retaining both files for every upload increases storage costs over time.

**Decision:** Keep originals for full-resolution viewing and generate compressed thumbnails for feeds. Consider lifecycle policies for older content only if the product's retention requirements allow them.

## 9. Scaling Priorities

I would scale SnapShare in the following order:

1. Use a CDN and object storage so photo delivery and storage do not overwhelm application servers.
2. Add more app servers behind the load balancer as application traffic increases.
3. Cache popular feed data and frequently accessed metadata.
4. Add a read replica to distribute eligible database reads.
5. Scale thumbnail workers horizontally based on the queue backlog.
6. Monitor request latency, cache hit rate, database load, upload failures, queue delays, and storage growth.
7. Introduce additional database partitioning or sharding only when measured database bottlenecks justify the added complexity.

## Conclusion

SnapShare should use a read-optimized, horizontally scalable architecture. Object storage and a CDN handle large photo files, while app servers, caching, and a database read replica support fast feed browsing. A message queue and thumbnail workers keep image processing asynchronous, allowing uploads to remain responsive as usage grows.
